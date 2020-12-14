'use strict';

const events = {};

events.error = require('./error');
events.close = require('./close');
events.request = require('./request');
events.listening = require('./listening');

module.exports = events;
