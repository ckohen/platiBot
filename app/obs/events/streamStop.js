'use strict';

const { Message } = require("discord.js");
const cache = require('memory-cache');

const helpers = require.main.require('./app/util/helpers');

module.exports = (socket, payload) => {
    if (cache.get('video.stream.down.ckohen') !== null) return;

    const farewell = socket.app.settings.get('irc_message_stream_down');
    socket.app.irc.say(socket.app.options.twitch.channel.name, farewell);

    socket.app.api.uptime((time) => {
        const duration = time ? `for ${helpers.relativeTime(time, 3)}` : '';

        socket.app.api.userChannel((channel) => {
            let streamPingChannel = socket.app.discord.getChannel('alerts');
            streamPingChannel.bulkDelete(1);
            
            socket.app.discord.sendMessage(
                'alerts',
                socket.app.discord.getContent('streamDown', [channel.display_name]),
                socket.app.discord.getEmbed('streamDown', [
                    channel, channel.game, duration,
                ]),
            );
        }, "ckohen");

        cache.del('stream.uptime.ckohen');
    }, "ckohen");

    // Throttle additional events
    const tenSecs = 10000;
    cache.put('video.stream.down.ckohen', 'trigger', tenSecs);
}