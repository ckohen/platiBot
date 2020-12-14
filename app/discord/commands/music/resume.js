module.exports = {
  channel: 'music',
  name: 'resume',
  aliases: ['resume-song', 'continue'],
  description: 'Resume the current paused song',

  async run(socket, message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    let musicData = socket.musicData.get(String(message.guild.id));
    if (
      typeof musicData.songDispatcher == 'undefined' ||
      musicData.songDispatcher === null
    ) {
      return message.reply('There is no song playing right now!');
    }

    message.channel.send('Song resumed :play_pause:');

    musicData.songDispatcher.resume();
  }
};
