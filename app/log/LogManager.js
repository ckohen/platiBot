'use strict';

const wn = require('winston');
const moment = require('moment');
const rp = require('request-promise');

/**
 * Log manager for the application.
 * @private
 */
class LogManager {
  /**
   * Create a new log manager instance.
   * @param {Application} app
   * @returns {self}
  */
  constructor(app) {
    /**
     * The application container.
     * @type {Application}
     */
    this.app = app;

    /**
     * The application options.
     * @type {Object}
     */
    this.opts = this.app.options;

    /**
     * The log driver.
     * @type {Winston}
     */
    this.driver = wn.createLogger({
      levels: this.opts.log.levels,
      format: wn.format.combine(
        wn.format.colorize(),
        wn.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        wn.format.printf(
          (info) => `${info.timestamp} ${info.level} ${info.message}`,
        ),
      ),
      transports: [
        new wn.transports.Console({
          level: this.app.debug ? 'debug' : 'error',
          handleExceptions: true,
        }),
        new wn.transports.File({
          handleExceptions: true,
          filename: this.opts.log.outputFile,
          level: this.opts.log.maxLevel,
        }),
      ],
    });

    wn.addColors(this.opts.log.colors);
  }

  /**
   * Write a message to the log.
   * @param {string} level
   * @param {Module} source
   * @param {string} message
   */
  async out(level, source, message) {
    const path = this.path(source);
    this.driver.log(level, `[${path}] ${message}`);
    await this.webhook(level, path, message);
  }

  /**
   * Exit the process after writing a message to the log.
   * @param {string} level
   * @param {Module} source
   * @param {string} message
   */
  async fatal(level, source, message) {
    const path = this.path(source);
    await this.out(level, path, message);
    this.app.end(1);
  }

  /**
   * Send a log message via webhook.
   * @param {string} level
   * @param {string} path
   * @param {string} message
   * @returns {Promise<Request>}
   */
  webhook(level, path, message) {
    const levels = this.opts.log.webhookLevels;

    if (!Object.prototype.hasOwnProperty.call(levels, level)) return;

    return rp({
      json: true,
      method: 'POST',
      baseUrl: this.opts.log.webhookBase,
      uri: this.opts.log.webhookToken.toString(),
      body: {
        embeds: [{
          description: typeof message === 'string' ? message : String(message),
          timestamp: moment().utcOffset(0).format(),
          title: `${level} \u00B7 ${path}`,
          color: this.opts.discord.colors[levels[level] || 'aqua'],
        }],
      },
    }).catch((err) => {
      this.driver.log('error', `[${this.path(module)}] Failed to send webhook: ${err}`);
    });
  }

  /**
   * Calculate the path of the given source module.
   * @param {Module} source
   * @returns {string}
   */
  path(source) {
    if (!source.id) return source;
    return source.id
      .split('.').shift()
      .replace(`${this.opts.basepath}/`, '')
      .replace(/\//g, '.');
  }
}

module.exports = LogManager;
