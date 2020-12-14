'use strict';
const { Message } = require('discord.js');
const cache = require('memory-cache');

module.exports = async (socket, url, headers) => {
    // Different handling for different users
    let user = headers.user;

    // Ignore empty or default users
    if (!user || user == "default") {
        return;
    }

    // Get the annoucement channel defined for the user
    let channel = await socket.getChannel(user);
    if (!channel) {
        console.log("No channel");
        return;
    }

    switch (user) {
        case "platicorn":
            const greeting = socket.app.settings.get('irc_message_stream_up');
            socket.app.irc.say(user, greeting);
            break;
        default:
            ;
    }

    let role = await socket.getRole(user, channel);
    if (!role) {
        console.log("No Role");
        return;
    }

    socket.app.api.userChannel(user, async (twitch) => {
        if (!twitch) {
            return;
        }
        let content = socket.app.discord.getContent('streamUp', [role, twitch.display_name, twitch.url]);
        let embed = socket.app.discord.getEmbed('streamUp', [twitch]);
        // Check if throttled
        let msg;
        if (cache.get(`video.stream.up.${user}`) !== null) {
            msg = await socket.getMessage(user);
            if (msg && msg instanceof Message){
                msg.edit(content, embed);
            }
        }
        else {
            msg = await channel.send(content, embed);
            if (msg.channel.type === 'news') {
                msg.crosspost().catch();
            }
            socket.setMessage(user, msg.id);
            // Throttle additional events
            const fourHours = 14400000;
            cache.put(`video.stream.up.${user}`, 'trigger', fourHours);
        }
    });
};