'use strict';

module.exports = {
    permissions: 'MUTE_MEMBERS',
    description: 'Unmutes all members in a channel',

    async run(socket, message) {

        // Check if voice channel
        const voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.reply('Join a channel and try again');

        // Unmute members
        voiceChannel.members.forEach(member => {
            member.setMute(false).catch((err) => {
                socket.app.log.out('error', module, err);
            });
        });

        message.delete()
    }
};