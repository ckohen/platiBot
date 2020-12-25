'use strict';

const { Collection } = require('discord.js');
const humanize = require('humanize-duration');
const moment = require('moment');

/**
 * Helpers for the application
 */
module.exports = {
  /**
   * Restricts a numeric value to be between to numbers
   * @param {number} value the number to clamp
   * @param {number} min the minimum desired value
   * @param {number} max the maximum desired value
   * @returns {number}
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Organizes an array of items into a discord collection based on a key
   * @param {Collection} map the collection to arrange the data in
   * @param {Object[]} items the data to rearrange
   * @param {string} key the element key to use as the identifier in the collection
   * @param {string} [secondaryKey] the second half of a hyphenated key
   * @param {string} [val] only store a specific value (secondaryKey must be set (can be false) to use this)
   */
  collect(map, items, key, secondaryKey, val = null) {
    if (!(map instanceof Collection)) return;
    if (Array.isArray(items) && items.length === 0) return;

    items.forEach(element => {
      if (!element[key]) return;
      map.set(element[key] + (secondaryKey ? `-${element[secondaryKey]}` : ''), val && element[val] ? element[val] : element);
    });
  },

  /**
   * Replaces parameters wrapped in {} with values
   * @param {string} template the message to format with additional information
   * @param {Object} values an object containing key value pairs of what to replace and what it is replaced with
   * @returns {string}
   */
  format(template, values = {}) {
    if (!template) return false;
    if (!values || Object.keys(values).length === 0) return template;
    return template.replace(/{([^{}]*)}/g, (match, key) => {
      if (!Object.prototype.hasOwnProperty.call(values, key)) return match;
      return values[key];
    });
  },

  /**
   * Makes a number of bytes easier to read for humans
   * @param {number} bytes the raw number of bytes
   * @returns {string}
   */
  humanBytes(bytes) {
    if (!bytes) return false;
    const unit = 1024;
    if (bytes > unit ** 3) return `${Math.round((100 * bytes) / unit ** 3) / 100} GiB`;
    if (bytes > unit ** 2) return `${Math.round((100 * bytes) / unit ** 2) / 100} MiB`;
    if (bytes > unit) return `${Math.round((100 * bytes) / unit) / 100} KiB`;
    return `${Math.round(bytes)} B`;
  },

  /**
   * Formats a date to the form `Month #, ####`
   * @param {Date} time the date to transform
   * @returns {string}
   */
  humanDate(time) {
    return moment(time).format('MMM D, YYYY');
  },

  /**
   * Formats a time in milliseconds to a human readable form
   * @param {number} diff the time to reformat
   * @returns {string}
   */
  humanDuration(diff) {
    return humanize(diff, {
      round: true,
      units: ['y', 'mo', 'd', 'h', 'm', 's'],
    });
  },

  /**
   * Generates a random value between the specified values
   * @param {number} min the minimum end of the allowed range
   * @param {number} max the maximum end of the allowed range
   * @returns {number}
   */
  jitter(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  /**
   * Formats a twitch message to start with a mention if set
   * @param {boolean} mention whether or not to mention the target
   * @param {string} target the person to send the message to
   * @param {string} message the message to augment
   * @returns {string}
   */
  mentionable(mention, target, message) {
    return mention === true ? `@${target} ${message}` : message;
  },

  /**
   * Gets the relative amount of time since a specified time
   * @param {Moment|string|number|Date} then the time to get the difference from now as
   * @param {number} specificity the maximum units to display
   * @param {boolean} preferHours whether to use hours instead of days
   * @returns {string}
   */
  relativeTime(then, specificity = 2, preferHours = false) {
    const twoDays = 172800000;
    const diff = moment().diff(then);
    const units = ['y', 'mo', 'd', 'h', 'm', 's'];
    if (preferHours && diff < twoDays) units.splice(2, 1);
    return humanize(diff, {
      units,
      conjunction: ' and ',
      largest: specificity,
      round: true,
      serialComma: false,
    });
  },

  /**
   * Formats an array of usages in a readable form
   * @param {string|string[]} value all of the available usage types
   * @param {string} prefix the prefix for the command
   * @param {string} command the command name
   * @returns {string}
   */
  usage(value, prefix, command) {
    if (!value || value.length === 0) return `${prefix}${command}`;
    const lines = Array.isArray(value) ? value : [value];
    return lines.map(line => `${prefix}${command} ${line}`).join('\n');
  },

  /**
   * A function caller that repatedly calls after a pseudo random time
   * @param {Function} callback the function to call after each delay
   * @param {Function} delay the function that determines a delay time (returns number)
   * @param {Function} [wrapper] a function called that handles the restart and callback of the interval
   * @returns {self}
   */
  variableInterval(callback, delay, wrapper) {
    /* eslint-disable-next-line consistent-this */
    const self = this;
    if (typeof callback !== 'function') {
      throw Error('Expected a callback function');
    }
    if (typeof delay !== 'function') {
      throw Error('Expected a delay function');
    }
    function clear() {
      clearTimeout(self.id);
      self.id = null;
    }
    function start() {
      const time = delay();
      if (typeof time === 'undefined' || time === null) return;
      self.id = setTimeout(self.wrapper, time);
    }
    self.wrapper =
      wrapper ||
      function w() {
        /* eslint-disable-next-line callback-return */
        callback();
        start();
      };
    start();
    self.clear = clear;
    return self;
  },
};
