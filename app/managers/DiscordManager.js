'use strict';

const { Client, Collection } = require('discord.js');

const EventManager = require('./EventManager');
const Composer = require('../discord/Composer');
const commands = require('../discord/commands');
const embeds = require('../discord/embeds');
const events = require('../discord/events');
const interactionHandler = require('../discord/interactionHandler');
const applicationCommands = require('../discord/interactions/applicationCommands');
const messages = require('../discord/messages');

const { collect } = require('../util/helpers');

/**
 * Discord manager for the application.
 * @extends {EventManager}
 */
class DiscordManager extends EventManager {
  constructor(app) {
    super(app, new Client(app.options.discord.options), app.options.discord, events);

    /**
     * The Discord.js API / Websocket Client.
     * @type {Client}
     * @name DiscordManager#driver
     */

    /**
     * The Discord rich embeds.
     * @type {Object}
     */
    this.embeds = embeds;

    /**
     * The message transformers.
     * @type {Object}
     */
    this.messages = messages;

    /**
     * The commands for the socket, mapped by input.
     * @type {Collection<string, Object>}
     */
    this.commands = new Collection();

    /**
     * The application commands for the socket, mapped by input.
     * @type {Collection<string, Object>}
     */
    this.applicationCommands = new Collection();

    /**
     * The color manager settings, mapped by guild.
     * @type {Collection<string, Object>}
     */
    this.colorManager = new Collection();

    /**
     * The role manager settings, mapped by guild.
     * @type {Collection<string, Object>}
     */
    this.roleManager = new Collection();

    /**
     * The reaction role manager settings, mapped by guild.
     * @type {Collection<string, Object>}
     */
    this.reactionRoles = new Collection();

    /**
     * The voice role manager settings, mapped by guild.
     * @type {Collection<string, Object>}
     */
    this.voiceRoles = new Collection();

    /**
     * The prefix settings, mapped by guild.
     * @type {Collection<string, Object>}
     */
    this.prefixes = new Collection();

    /**
     * The rooms currently stored, mapped by guild-roomID.
     * @type {Collection<string, Object>}
     */
    this.rooms = new Collection();

    /**
     * The random channel movement settings, mapped by guild.
     * @type {Collection<string, Object>}
     */
    this.randomChannels = new Collection();

    /**
     * The new member role settings, mapped by guild.
     * @type {Collection<string, Object>}
     */
    this.newMemberRole = new Collection();

    /**
     * The music data, mapped by guild.
     * @type {Collection<string, Object>}
     */
    this.musicData = new Collection();
  }

  /**
   * Initialize the manager.
   * @returns {Promise<string>}
   */
  async init() {
    this.attach();
    // Temporary Addition to handle interactions before discord.js does
    this.driver.ws.on('INTERACTION_CREATE', async packet => {
      const result = await interactionHandler(this.driver, packet);

      await this.driver.api.interactions(packet.id, packet.token).callback.post({
        data: result,
      });
    });
    // End addition

    Object.entries(commands).forEach(([command, handler]) => {
      this.commands.set(command, handler);
    });

    Object.entries(applicationCommands).forEach(([command, handler]) => {
      this.applicationCommands.set(command, handler);
    });

    await this.setCache();

    return this.driver.login(this.app.options.discord.token).catch(err => {
      this.app.log.error(module, `Login: ${err}`);
    });
  }

  /**
   * Cache all managers and music.
   * @returns {Promise<void>}
   */
  setCache() {
    return Promise.all([
      Promise.all(
        this.app.database.tables.discord.map(async table => {
          const name = table.constructor.name.replace(/Table$/, '');
          await this.cache(table, this[name], 'guildID');
        }),
      ),
      this.cacheMusic(),
      this.cacheRooms(),
    ]).catch(err => {
      this.app.log.fatal(module, `Cache: ${err}`);
    });
  }

  /**
   * Cache the music data.
   * @returns {Promise<void>}
   * @private
   */
  cacheMusic() {
    return this.app.database.tables.volumes.get().then(volumes => {
      this.musicData.clear();
      volumes.forEach(volume => {
        if (this.musicData.get(volume.guildID)) {
          this.musicData.get(volume.guildID).volume = Number(volume.volume);
        } else {
          this.musicData.set(volume.guildID, { queue: [], isPlaying: false, nowPlaying: null, songDispatcher: null, volume: Number(volume.volume) });
        }
      });
    });
  }

  /**
   * Cache room data.
   * @returns {Promise<void>}
   * @private
   */
  cacheRooms() {
    return this.app.database.tables.rooms.get().then(rooms => {
      this.rooms.clear();
      let roomGuild, roomID;
      let guild;
      rooms.forEach(room => {
        [roomGuild, roomID] = room.guildRoomID.split('-');
        guild = this.rooms.get(roomGuild);
        if (!guild) {
          this.rooms.set(roomGuild, new Collection());
          guild = this.rooms.get(roomGuild);
        }
        guild.set(roomID, room.data);
      });
    });
  }

  /**
   * Query the database and set a given cache.
   * @param {BaseTable} table the database table to get from
   * @param {Collection} map the map to store data in
   * @param {string} key a key to use for the new map
   * @param {string} [secondaryKey=false] a dashed key to use for the new map
   * @returns {Promise}
   * @private
   */
  cache(table, map, key, secondaryKey = false) {
    return table.get().then(all => {
      map.clear();
      collect(map, all, key, secondaryKey);
    });
  }

  /**
   * Test a channel ID against the setting for the given key
   * @param {string} id the id of the channel to test
   * @param {string} key the channel name in settings to test against
   * @returns {boolean}
   */
  isChannel(id, key) {
    return id === this.app.settings.get(`discord_channel_${key}`);
  }

  /**
   * Test a guild ID against the setting for the given key
   * @param {string} id the id of the guild to test
   * @param {string} key the guild name in settings to test against
   * @returns {boolean}
   */
  isGuild(id, key) {
    return id === this.app.settings.get(`discord_guild_${key}`);
  }

  /**
   * Get the channel for the given slug.
   * @param {string} slug the channel name in settings to get
   * @returns {?Channel}
   */
  getChannel(slug) {
    const id = this.app.settings.get(`discord_channel_${slug}`).split(',')[0];
    return this.driver.channels.cache.get(id);
  }

  /**
   * Get the webhook for the given slug.
   * @param {string} slug the webhook name in settings to get
   * @returns {?Promise<Webhook>}
   */
  getWebhook(slug) {
    let uri;
    try {
      uri = this.app.settings.get(`discord_webhook_${slug}`);
      this.driver.fetchWebhook(...uri.split('/'));
    } catch {
      return Promise.resolve(false);
    }
    return this.driver.fetchWebhook(...uri.split('/'));
  }

  /**
   * Get the transformed content for the given slug.
   * @param {string} slug the name of the message to get
   * @param {Array} args arguments to pass to the transformer
   * @returns {?string}
   */
  getContent(slug, args) {
    const transformer = this.messages[slug];

    if (typeof transformer !== 'function') {
      this.app.log.warn(module, `Unknown content: ${transformer}`);
      return null;
    }

    return transformer(...args);
  }

  /**
   * Get the transformed embed for the given slug.
   * @param {string} slug the name of the embed to get
   * @param {Array} args arguments to pass to the constructor
   * @returns {?string}
   */
  getEmbed(slug, args) {
    const transformer = this.embeds[slug];

    if (typeof transformer !== 'function') {
      this.app.log.warn(module, `Unknown embed: ${transformer}`);
      return null;
    }

    return transformer(new Composer(this.app.options), ...args);
  }

  /**
   * Send a message with the given content and embed.
   * @param {string} slug the channel name in settings to get and send to
   * @param {string|RichEmbed} content the content to send
   * @param {MessageOptions|Attachment|MessageEmbed} [embed] The options to provide
   */
  sendMessage(slug, content, embed) {
    const channel = this.getChannel(slug);

    if (!channel) {
      this.app.log.warn(module, `No channel set for slug: ${slug}`);
      return;
    }

    channel.send(content, embed).catch(err => {
      this.app.log.error(module, `Send message: ${err}`);
    });
  }

  /**
   * Send a webhook with the given content and embed.
   * @param {string} slug the webhook name in settings to get and send to
   * @param {string|RichEmbed} content the content to send
   * @param {WebhookMessageOptions|Attachment|MessageEmbed} [embed] The options to provide
   */
  sendWebhook(slug, content, embed) {
    this.getWebhook(slug).then(webhook => {
      if (!webhook) {
        this.app.log.warn(module, `No webhook set for slug: ${slug}`);
        return;
      }

      webhook.send(content, embed).catch(err => {
        this.app.log.error(module, `Send webhook: ${err}`);
      });
    });
  }
}

module.exports = DiscordManager;