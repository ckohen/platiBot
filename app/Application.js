'use strict';

const { Collection } = require('discord.js');

const DatabaseManager = require('./managers/DatabaseManager');
const DiscordManager = require('./managers/DiscordManager');
const HTTPManager = require('./managers/HTTPManager');
const LogManager = require('./managers/LogManager');
const TwitchManager = require('./managers/TwitchManager');
const logBuilder = require('./util/LogRouter');
const { collect } = require('./util/helpers');

/**
 * The application container.
 * @version 1.1.0
 */
class Application {
  /**
   * Create a new application instance.
   * @param {Object} [options={}] the options to provide to the application
   * @public
   */
  constructor(options = {}) {
    this.setOptions(options);

    /**
     * Whether the application is in debug mode.
     * @type {boolean}
     * @private
     */
    this.debug = this.options.app.debug === 'true';

    /**
     * The Twitch manager for the application.
     * @type {TwitchManager}
     */
    this.twitch = new TwitchManager(this);

    /**
     * The log manager for the application.
     * @type {LogManager}
     * @private
     */
    this.logger = new LogManager(this);

    /**
     * The settings for the application, mapped by name.
     * @type {Collection<string, Object>}
     */
    this.settings = new Collection();

    /**
     * The streaming settings for the application, mapped by name.
     * @type {Collection<string, Object>}
     */
    this.streaming = new Collection();

    /**
     * The Discord manager for the application.
     * @type {DiscordManager}
     */
    this.discord = new DiscordManager(this);

    /**
     * The HTTP Server manager for the application.
     * @type {HTTPManager}
     */
    this.http = new HTTPManager(this);

    /**
     * The database manager for the application.
     * @type {DatabaseManager}
     */
    this.database = new DatabaseManager(this);

    /**
     * True when intentionally ending the application so subapplications do not restart
     * @type {Boolean}
     * @private
     */
    this.ending = false;
  }

  /**
   * Logging shortcut. Logs to `info` by default. Other levels are properties.
   * @type {Logging}
   * @readonly
   */
  get log() {
    return logBuilder(this);
  }

  /**
   * Boot the application.
   * @public
   */
  async boot() {
    // Run tasks in parallel to avoid serial delays
    await Promise.all([this.setSettings(), this.setStreaming()]);

    await Promise.all([this.discord.init(), this.twitch.irc.init()]);
    await this.http.init();

    this.log(module, 'Boot complete');
    // Send "Ready" to parent if it exists
    if (typeof process.send === 'function') {
      process.send('ready');
    }
  }

  async end(code) {
    this.ending = true;
    try {
      await this.twitch.irc.driver.disconnect();
      await this.discord.driver.destroy();
      await this.http.driver.close();
    } catch (err) {
      this.log.error(module, `Error when shutting down: ${err}`);
    }
    process.exit(code);
  }

  /**
   * Validate and set the configuration options for the application.
   * @param {Object} options the options to validate
   * @throws {TypeError}
   * @private
   */
  setOptions(options) {
    if (Object.keys(options).length === 0 && options.constructor === Object) {
      throw new TypeError('The application must be provided with an options object.');
    }

    this.options = options;
    this.options.basepath = __dirname;
  }

  /**
   * Cache all database settings for the application.
   * @returns {Promise}
   * @private
   */
  setSettings() {
    return this.database.tables.settings
      .get()
      .then(all => collect(this.settings, all, 'name', null, 'value'))
      .catch(err => {
        this.log.fatal(module, `Settings: ${err}`);
      });
  }

  /**
   * Cache all database streaming settings for the application.
   * @returns {Promise}
   * @private
   */
  setStreaming() {
    return this.database.tables.streaming
      .get()
      .then(all => collect(this.streaming, all, 'name', null))
      .catch(err => {
        this.log.fatal(module, `Streaming Settings: ${err}`);
      });
  }
}

module.exports = Application;
