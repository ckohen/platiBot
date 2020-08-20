'use strict';

const { Client, Collection } = require('discord.js');

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
    this.driver = new Client();

    /**
     * The commands for the socket, mapped by input.
     * @type {Collection<string, Object>}
     */
    this.commands = new Collection();
    this.musicData = {
      queue: [],
      isPlaying: false,
      nowPlaying: null,
      songDispatcher: null,
      volume: 0,
    };
  }

  /**
   * Initialize the manager.
   * @returns {Promise}
   */
  init() {
    this.attach();

    Object.entries(commands).forEach(([command, handler]) => {
      this.commands.set(command, handler);
    });
    this.musicData.volume = Number(this.app.settings.get(`discord_music_volume`));
    return this.driver.login(this.app.options.discord.token).catch((err) => {
      this.app.log.out('error', module, `Login: ${err}`);
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
   * Get the channel for the given slug.
   * @param {string} slug
   * @returns {?Channel}
   */
  getChannel(slug) {
    const id = this.app.settings.get(`discord_channel_${slug}`);
    return this.driver.channels.get(id);
  }

  /**
   * Get the webhook for the given slug.
   * @param {string} slug
   * @returns {?Promise<Webhook>}
   */
  getWebhook(slug) {
    const uri = this.app.settings.get(`discord_webhook_${slug}`);
    return this.driver.fetchWebhook(...uri.split('/'));
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
   * @param {MessageOptions|Attachment|RichEmbed} [embed]
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
   * @param {WebhookMessageOptions|Attachment|RichEmbed} [embed]
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
