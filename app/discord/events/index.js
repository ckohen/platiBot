'use strict';

const events = {};

events.error = require('./error');
events.ready = require('./ready');
events.message = require('./message');
events.guildMemberAdd = require('./guildMemberAdd');
events.voiceStateUpdate = require('./voiceStateUpdate');
events.guildMemberRemove = require('./guildMemberRemove');
events.guildMemberUpdate = require('./guildMemberUpdate');
events.guildBanAdd = require('./guildBanAdd');
events.guildBanRemove = require('./guildBanRemove');
events.messageUpdate = require('./messageUpdate');
events.messageDelete = require('./messageDelete');

module.exports = events;
