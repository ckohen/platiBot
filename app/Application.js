'use strict';

const { Collection } = require('discord.js');

const { collect } = require('./util/helpers');
const ApiManager = require('./api/ApiManager');
const IrcManager = require('./irc/IrcManager');
const LogManager = require('./log/LogManager');
const DiscordManager = require('./discord/DiscordManager');
const OBSManager = require('./obs/OBSManager');
const HTTPManager = require('./http/HTTPManager');
const DatabaseManager = require('./database/DatabaseManager');

/**
 * The application container.
 * @version 1.1.0
 */
class Application {
  /**
   * Create a new application instance.
   * @param {Object} [options]
   * @returns {self}
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
     * The API manager for the application.
     * @type {ApiManager}
     * @private
     */
    this.api = new ApiManager(this);

    /**
     * The IRC manager for the application.
     * @type {IrcManager}
     * @private
     */
    this.irc = new IrcManager(this);

    /**
     * The log manager for the application.
     * @type {LogManager}
     * @public
     */
    this.log = new LogManager(this);

    /**
     * The settings for the application, mapped by name.
     * @type {Collection<string, Object>}
     * @private
     */
    this.settings = new Collection();

    /**
     * The streaming settings for the application, mapped by name.
     * @type {Collection<string, Object>}
     * @private
     */
    this.streaming = new Collection();

    /**
     * The Discord manager for the application.
     * @type {DiscordManager}
     * @private
     */
    this.discord = new DiscordManager(this);

    /**
     * The OBS manager for the application.
     * @type {OBSManager}
     * @private
     */
    this.obs = new OBSManager(this);

     /**
     * The HTTP Server manager for the application.
     * @type {HTTPManager}
     * @private
     */
    this.http = new HTTPManager(this);

    /**
     * The database manager for the application.
     * @type {DatabaseManager}
     * @private
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
   * Boot the application.
   * @public
   */
  async boot() {
    // Run tasks in parallel to avoid serial delays
    await Promise.all([this.irc.init(), this.setSettings(), this.setStreaming()]);

    await this.discord.init();
    await this.http.init();
    //this.obs.init();

    this.log.out('info', module, 'Boot complete');
    // Send "Ready" to parent if it exists
    if (typeof process.send === "function") {
      process.send('ready');
    }
  }

  async end(code) {
    this.ending = true;
    try {
      await this.irc.driver.disconnect();
      await this.discord.driver.destroy();
      await this.http.driver.close();
      //await this.obs.driver.disconnect();
    }
    catch {
      ;
    }
    process.exit(code);
  }

  /**
   * Validate and set the configuration options for the application.
   * @param {Object} options
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
    return this.database.getSettings()
      .then((all) => collect(this.settings, all, 'name', null, 'value'))
      .catch((err) => {
        this.log.fatal('critical', module, `Settings: ${err}`);
      });
  }

  /**
   * Cache all database streaming settings for the application.
   * @returns {Promise}
   * @private
   */
  setStreaming() {
    return this.database.getStreaming()
      .then((all) => collect(this.streaming, all, 'name', null))
      .catch((err) => {
        this.log.fatal('critical', module, `Streaming Settings: ${err}`);
      });
  }
}

module.exports = Application;
