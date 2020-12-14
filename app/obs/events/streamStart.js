'use strict';

const { Message } = require("discord.js");

module.exports = (socket, payload) => {
    let destination_channel = socket.app.discord.driver.channels.cache.get('742651473158209577');
    const greeting = socket.app.settings.get('irc_message_stream_up');
    socket.app.irc.say(socket.app.options.twitch.channel.name, greeting);

    let fakeMsg = new Message();
    fakeMsg.channel = destination_channel;
    let role = fakeMsg.guild.roles.cache.find(roles => roles.name === "Twitch Ping");

    socket.app.api.channel((channel) => {
        socket.app.discord.sendMessage(
            'alerts',
            socket.app.discord.getContent('streamUp', [role, channel.display_name, channel.url]),
            socket.app.discord.getEmbed('streamUp', [channel]),
        );
    });
}