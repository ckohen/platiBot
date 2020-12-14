'use strict';

const { MessageEmbed } = require('discord.js');

/**
 * Composer for rich Discord embeds.
 * @extends {MessageEmbed}
 * @private
 */
class Composer extends MessageEmbed {
  /**
   * Create a new composer instance.
   * @param {Object} options
   * @param {Object} [data]
   * @returns {self}
  */
  constructor(options, data = {}) {
    super(data);
    this.options = options;
  }

  /**
   * Set the color for the embed.
   * @param {string} color
   * @returns {self}
   */
  setColor(color) {
    this.color = this.options.discord.colors[color];
    return this;
  }
}

module.exports = Composer;
