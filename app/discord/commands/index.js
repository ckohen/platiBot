'use strict';

const commands = {};

commands.help = require('./help');
commands.commands = require('./commands');
commands.twitch = require('./twitch');
commands.invite = require('./invite');

function concat(obj, variable) {
    for(let key of Object.keys(obj)) {
        if(!variable[key]) variable[key] = {};
        for(let innerKey of Object.keys(obj[key])) variable[key][innerKey] = obj[key][innerKey];
    }
}

concat(require('./music'), commands);
concat(require('./roles'), commands);
concat(require('./gaming'), commands);
concat(require('./management'), commands);
concat(require('./moderation'), commands);

module.exports = commands;
