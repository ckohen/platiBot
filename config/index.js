'use strict';

const config = {};

config.api = require('./api');
config.app = require('./app');
config.irc = require('./irc');
config.log = require('./log');
config.twitch = require('./twitch');
config.discord = require('./discord');
config.database = require('./database');
config.throttle = require('./throttle');
config.youtube = require('./youtube');
config.obs = require('./obs');
config.http = require('./http');

module.exports = config;
