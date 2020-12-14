'use strict';

module.exports = {
    permissions: 'MOVE_MEMBERS',
    description: 'Moves all members in your vc (or specified vc) to another vc',
    args: true,
    usage: [
        '<string name of channel to move to>',
        '<string name of channel to move from> -> <string name of channel to move to>'
    ],

    async run(socket, message, args) {
        let voiceChannel;
        let newChannel;
        let toChannel;
        // Move users in curent channel
        if (args.indexOf("->") < 0) {
            // Check if voice channel
            voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.reply('Join a channel and try again');

            toChannel = args.join(' ');

            // Check for new channel
            newChannel = await message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === toChannel.toLowerCase() && channel.type === "voice");
        }
        // Move users in specified channel
        else {;
            let fromChannel = args.slice(0, args.indexOf("->")).join(' ');
            toChannel = args.slice(args.indexOf("->") + 1).join(' ');
            voiceChannel = await message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === fromChannel.toLowerCase() && channel.type === "voice");
            newChannel = await message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === toChannel.toLowerCase() && channel.type === "voice");
        }

        let confMsg;


        if (newChannel && voiceChannel) {
            // Move members
            voiceChannel.members.forEach(member => {
                member.voice.setChannel(newChannel).catch((err) => {
                    socket.app.log.out('error', module, err);
                });
            });
            confMsg = await message.channel.send("Moving all voice members to " + newChannel.name);
        }
        else if (newChannel) {
            confMsg = await message.reply(fromChannel + " is not a valid voice channel!");
        }
        else {
            confMsg = await message.reply(toChannel + " is not a valid voice channel!");
        }
        message.delete()
        confMsg.delete({ timeout: 3000 });
    }
};