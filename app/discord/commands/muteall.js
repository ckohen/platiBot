'use strict';

module.exports = {
    permissions: 'MUTE_MEMBERS',
    description: 'Mutes all members in a channel (auto-unmute after)',
    usage: [
        '',
        '<delay before auto-unmute or 0>'
    ],

    async run(socket, message, args) {

        // Check if voice channel
        const voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.reply('Join a channel and try again');

        let delay = 15000;

        const [newCountRaw, ...extra] = args;
        const newCount = newCountRaw ? Number(newCountRaw) : -1;

        if (newCount > 0) {
            delay = newCount * 1000;
        }

        // Count muted users
        let count = voiceChannel.members.size;

        // Mute members
        await voiceChannel.members.forEach(async function (member) {
            member.setMute(true).catch((err) => {
                socket.app.log.out('error', module, err);
            });
        });

        let confMsg = await message.channel.send("Muted " + count + " users in " + voiceChannel);

        message.delete();
        setTimeout(function () { confMsg.delete(); }, 3000);

        if (newCount !== 0) {
            setTimeout(function () {
                voiceChannel.members.forEach(member => {
                    member.setMute(false).catch((err) => {
                        socket.app.log.out('error', module, err);
                    });
                });
            }, delay);
        }
    }
};