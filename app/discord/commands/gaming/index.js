'use strict';

const commands = {};

commands.addwin = require('./addwin');
commands.setwins = require('./setwins');
commands.room = require('./room');
commands.random = require('./random');

module.exports = commands;
