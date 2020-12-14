'use strict';
const { Message } = require('discord.js');
const helpers = require('../../util/helpers');
const cache = require('memory-cache');

module.exports = async (socket, url, headers) => {
    // Different handling for different users
    let user = headers.user;
    if (cache.get(`video.stream.down.${user}`) !== null) return;

    // Ignore empty or default users
    if (!user || user == "default") {
        return;
    }

    // Get the annoucement channel defined for the user
    let channel = await socket.getChannel(user);
    if (!channel) {
        return;
    }

    switch (user) {
        case "platicorn":
            const farewell = socket.app.settings.get('irc_message_stream_down');
            socket.app.irc.say(user, farewell);
        break;
        default:
            ;
    }

    let role = await socket.getRole(user, channel);
    if (!role) {
        return;
    }

    socket.app.api.uptime((time) => {
        const duration = time ? `for ${helpers.relativeTime(time, 3)}` : '';

        socket.app.api.userChannel(user, async (twitch) => {
            if (!twitch) {
                return;
            }
            let content = socket.app.discord.getContent('streamDown', [twitch.display_name]);
            let embed = socket.app.discord.getEmbed('streamDown', [twitch, twitch.game, duration]);
            let msg = await socket.getMessage(user);
            if (msg && msg instanceof Message){
                msg.edit(content, embed);
            }
        });

        cache.del(`stream.uptime.${user}`);
    }, user);

    // Throttle additional events
    const tenSec = 10000;
    cache.put(`video.stream.down.${user}`, 'trigger', tenSec);
};