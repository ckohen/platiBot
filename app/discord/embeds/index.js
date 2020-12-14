'use strict';

const embeds = {};

embeds.message = require('./message');
embeds.whisper = require('./whisper');
embeds.streamUp = require('./streamUp');
embeds.memberAdd = require('./memberAdd');
embeds.streamDown = require('./streamDown');
embeds.memberRemove = require('./memberRemove');
embeds.play = require('./play');
embeds.queue = require('./queue');
embeds.songSearch = require('./songSearch');
embeds.videoEmbed = require('./videoEmbed');
embeds.userChange = require('./userChange');
embeds.roleChange = require('./roleChange');
embeds.userBanChange = require('./userBanChange');
embeds.messageEdit = require('./messageEdit');
embeds.messageRemove = require('./messageRemove');
embeds.fallWins = require('./fallWins');
embeds.rolemanager = require('./rolemanager');
embeds.colormanager = require('./colormanager');
embeds.welcome = require('./welcome');
embeds.help = require('./help');
embeds.rooms = require('./rooms');
embeds.reactionRoles = require('./reactionRoles');
embeds.voiceRoles = require('./voiceRoles');

module.exports = embeds;
