'use strict';

const commands = {};

commands.reboot = require('./reboot');
commands.reload = require('./reload');
commands.status = require('./status');
commands.setstatus = require('./setstatus');

module.exports = commands;
