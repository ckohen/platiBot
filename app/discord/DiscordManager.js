'use strict';

const { Client, Collection, MessageEmbed } = require('discord.js');
const { collect } = require('../util/helpers');

const embeds = require('./embeds');
const events = require('./events');
const Socket = require('../Socket');
const commands = require('./commands');
const Composer = require('./Composer');
const messages = require('./messages');

/**
 * Discord manager for the application.
 * @extends {Socket}
 * @private
 */
class DiscordManager extends Socket {
  /**
   * Create a new Discord manager instance.
   * @param {Application} app
   * @returns {self}
  */
  constructor(app) {
    super();

    /**
     * The application container.
     * @type {Application}
     */
    this.app = app;

    /**
     * The Discord rich embeds.
     * @type {Object}
     */
    this.embeds = embeds;

    /**
     * The socket events.
     * @type {Object}
     */
    this.events = events;

    /**
     * The message transformers.
     * @type {Object}
     */
    this.messages = messages;

    /**
     * The Discord driver.
     * @type {Client}
     */
    this.driver = new Client(this.app.options.discord.options);

    /**
     * The commands for the socket, mapped by input.
     * @type {Collection<string, Object>}
     */
    this.commands = new Collection();

    this.colorManager = new Collection();

    this.roleManager = new Collection();

    this.reactionRoles = new Collection();

    this.voiceRoles = new Collection();

    this.prefixes = new Collection();

    this.rooms = new Collection();

    this.randomSettings = new Collection();

    this.newMemberRoles = new Collection();

    this.musicData = new Collection();
  }

  /**
   * Initialize the manager.
   * @returns {Promise}
   */
  async init() {
    this.attach();

    Object.entries(commands).forEach(([command, handler]) => {
      this.commands.set(command, handler);
    });

    await this.setCache();

    return this.driver.login(this.app.options.discord.token).catch((err) => {
      this.app.log.out('error', module, `Login: ${err}`);
    });
  }

  /**
   * Cache all managers and music.
   * @returns {Promise}
   */
  setCache() {
    return Promise.all([
      this.cache('getRoleManager', this.roleManager, 'guildID'),
      this.cache('getColorManager', this.colorManager, 'guildID'),
      this.cache('getReactionRoles', this.reactionRoles, 'guildID'),
      this.cache('getVoiceRoles', this.voiceRoles, 'guildID'),
      this.cache('getPrefixes', this.prefixes, 'guildID'),
      this.cache('getRandom', this.randomSettings, 'guildID'),
      this.cache('getAddMembers', this.newMemberRoles, 'guildID'),
      this.cacheMusic(),
      this.cacheRooms(),
    ]).catch((err) => {
      this.app.log.fatal('critical', module, `Cache: ${err}`);
    });
  }

  /**
   * Cache the music data.
   * @returns {Promise}
   */
  cacheMusic() {
    return this.app.database.getVolume().then((volumes) => {
      this.musicData.clear();
      volumes.forEach((volume) => {
        if (this.musicData.get(volume.guildID)) {
          this.musicData.get(volume.guildID).volume = Number(volume.volume);
        }
        else {
          this.musicData.set(volume.guildID, { queue: [], isPlaying: false, nowPlaying: null, songDispatcher: null, volume: Number(volume.volume) });
        }
      })
    })
  }
  
  /**
   * Cache room data.
   * @returns {Promise}
   */
  cacheRooms() {
    return this.app.database.getRooms().then((rooms) => {
      this.rooms.clear();
      let roomGuild, roomID;
      let guild;
      rooms.forEach((room) => {
        [roomGuild, roomID] = room.guildRoomID.split('-');
        guild = this.rooms.get(roomGuild);
        if (!guild) {
          this.rooms.set(roomGuild, new Collection());
          guild = this.rooms.get(roomGuild);
        }
        guild.set(roomID, room.data);
      })
    })
  }

  /**
   * Query the database and set a given cache.
   * @param {string} method
   * @param {Collection} map
   * @param {string} key
   * @returns {Promise}
   */
  cache(method, map, key, secondaryKey = false) {
    return this.app.database[method]().then((all) => {
      map.clear();
      collect(map, all, key, secondaryKey);
    });
  }

  /**
   * Test a channel ID against the setting for the given key
   * @param {number} id
   * @param {string} key
   * @returns {boolean}
   */
  isChannel(id, key) {
    return id === this.app.settings.get(`discord_channel_${key}`);
  }

  /**
  * Test a guild ID against the setting for the given key
  * @param {number} id
  * @param {string} key
  * @returns {boolean}
  */
  isGuild(id, key) {
    return id === this.app.settings.get(`discord_guild_${key}`);
  }

  /**
   * Get the channel for the given slug.
   * @param {string} slug
   * @returns {?Channel}
   */
  getChannel(slug) {
    const id = this.app.settings.get(`discord_channel_${slug}`).split(',')[0];
    return this.driver.channels.cache.get(id);
  }

  /**
   * Get the webhook for the given slug.
   * @param {string} slug
   * @returns {?Promise<Webhook>}
   */
  getWebhook(slug) {
    let uri;
    try {
      uri = this.app.settings.get(`discord_webhook_${slug}`);
      this.driver.fetchWebhook(...uri.split('/'));
    }
    catch {
      return Promise.resolve(false);
    }
    return this.driver.fetchWebhook(...uri.split('/'));;
  }

  /**
   * Get the transformed content for the given slug.
   * @param {string} slug
   * @param {Array} args
   * @returns {?string}
   */
  getContent(slug, args) {
    const transformer = this.messages[slug];

    if (typeof transformer !== 'function') {
      this.app.log.out('warn', module, `Unknown content: ${transformer}`);
      return;
    }

    return transformer(...args);
  }

  /**
   * Get the transformed embed for the given slug.
   * @param {string} slug
   * @param {Array} args
   * @returns {?string}
   */
  getEmbed(slug, args) {
    const transformer = this.embeds[slug];

    if (typeof transformer !== 'function') {
      this.app.log.out('warn', module, `Unknown embed: ${transformer}`);
      return;
    }

    return transformer(new Composer(this.app.options), ...args);
  }

  /**
   * Send a message with the given content and embed.
   * @param {string} slug
   * @param {string|RichEmbed} content
   * @param {MessageOptions|Attachment|MessageEmbed} [embed]
   */
  sendMessage(slug, content, embed) {
    const channel = this.getChannel(slug);

    if (!channel) {
      this.app.log.out('warn', module, `No channel set for slug: ${slug}`);
      return;
    }

    channel.send(content, embed).catch((err) => {
      this.app.log.out('error', module, `Send message: ${err}`);
    });
  }

  /**
   * Send a webhook with the given content and embed.
   * @param {string} slug
   * @param {string|RichEmbed} content
   * @param {WebhookMessageOptions|Attachment|MessageEmbed} [embed]
   */
  sendWebhook(slug, content, embed) {
    this.getWebhook(slug).then((webhook) => {
      if (!webhook) {
        this.app.log.out('warn', module, `No webhook set for slug: ${slug}`);
        return;
      }

      webhook.send(content, embed).catch((err) => {
        this.app.log.out('error', module, `Send webhook: ${err}`);
      });
    });
  }
}

module.exports = DiscordManager;
