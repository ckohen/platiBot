'use strict';

const moment = require('moment');
const cache = require('memory-cache');
const rp = require('request-promise');

const Request = require('../Request');

/**
 * API manager for the application.
 * @extends {Request}
 * @private
 */
class ApiManager extends Request {
  /**
   * Create a new API manager instance.
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
     * The application options.
     * @type {Object}
     */
    this.opts = this.app.options;

    /**
     * The API driver.
     * @type {Function}
     */
    this.driver = rp.defaults({
      baseUrl: this.opts.api.baseUrl,
      headers: {
        Accept: this.opts.api.mime,
        'Client-ID': this.opts.api.client,
      },
    });
  }

  /**
   * Get the channel for the application's channel ID.
   * @param {Function} callback
   * @param {Number} userId
   */
  channel(callback, userId = false) {
    if (userId) {
      return this.get(`channels/${userId}`, {}, callback);
    }
    this.get(`channels/${this.opts.twitch.channel.id}`, {}, callback);
  }

  /**
   * Get the channel for the specfied user's channel name.
   * @param {String} user
   * @param {Function} callback
   */
  async userChannel(user, callback) {
    try {
      this.get(`users?login=${user}`, {}, (userObj) => {
        let id = userObj.users[0]._id;
        this.get(`channels/${id}`, {}, callback);
      });
    }
    catch {
      callback(false);
    }
  }

  /**
   * Get a follow object for the given user ID.
   * @param {number} userId
   * @param {Number} streamId
   * @returns {Promise<Request>}
   */
  follow(userId, streamerId = false) {
    if (streamId) {
      return this.promise(`users/${userId}/follows/channels/${streamerId}`);
    }
    return this.promise(`users/${userId}/follows/channels/${this.opts.twitch.channel.id}`);
  }

  /**
   * Get the stream for the application's channel ID.
   * @param {Function} callback
   * @param {Number} userId
   */
  stream(callback, userId = false) {
    if (userId) {
      return this.get(`streams/${userId}`, {}, callback);
    }
    this.get(`streams/${this.opts.twitch.channel.id}`, {}, callback);
  }

  /**
   * Get a user for the given login name.
   * @param {string} name
   * @param {Function} callback
   */
  user(name, callback) {
    this.get(`users?login=${name}`, {}, callback);
  }

  /**
   * Get the uptime for the application's stream.
   * @param {Function} callback
   * @param {boolean} [readOnly]
   * @param {string} user
   */
  uptime(callback, user, readOnly = false) {
    const cached = cache.get(`stream.uptime.${user}`);
    const cachedId = cache.get(`stream.user.${user}`);

    if (cached !== null) {
      callback(cached);
      return;
    }

    if (cachedId !== null) {
      this.stream((body) => {
        this.uptimeCallback(body, callback, user, cachedId, readOnly);
      }, cachedId)
    }

    try {
      this.get(`users?login=${user}`, {}, (userObj) => {
        let id = userObj.users[0]._id;
        this.stream((body) => {
          this.uptimeCallback(body, callback, user, id, readOnly);
        }, id);
      });
    }
    catch {
      return;
    }
  }

  uptimeCallback(body, callback, user, id, readOnly) {
    // Channel not live
    if (body.stream === null) return callback();

    // Stream start timestamp in milliseconds
    const time = moment(body.stream.created_at).valueOf();

    if (!readOnly) {
      const thirtyMins = 1800000;
      const fiveMins = 300000;
      cache.put(`stream.uptime.${user}`, time, fiveMins);
      cache.put(`stream.user.${user}`, id, thirtyMins);
    }

    callback(time);
  }
}

module.exports = ApiManager;
