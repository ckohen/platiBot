'use strict';

const { Util } = require('discord.js');

/**
 * Represents a data model that is identifiable by a Snowflake (i.e. Discord API data models).
 * @abstract
 */
class Base {
  constructor(socket) {
    /**
     * The app that instantiated this
     * @name TwitchBase#app
     * @type {Application}
     * @readonly
     */
    Object.defineProperty(this, 'app', { value: socket.app });

    /**
     * The twitch manager that instantiated this
     * @name TwitchBase#socket
     * @type {TwitchManager}
     * @readonly
     */
    Object.defineProperty(this, 'socket', { value: socket });
  }

  _clone() {
    return Object.assign(Object.create(this), this);
  }

  _patch(data) {
    return data;
  }

  _update(data) {
    const clone = this._clone();
    this._patch(data);
    return clone;
  }

  toJSON(...props) {
    return Util.flatten(this, ...props);
  }

  valueOf() {
    return this.id;
  }
}

module.exports = Base;
