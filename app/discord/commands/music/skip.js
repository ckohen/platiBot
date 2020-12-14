module.exports = {
  channel: 'music',
  name: 'skip',
  aliases: ['skip-song', 'advance-song'],
  description: 'Skip the current playing song',
  role: 'DJ',

  async run(socket, message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    let musicData = socket.musicData.get(String(message.guild.id));
    if (
      typeof musicData.songDispatcher == 'undefined' ||
      musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }
    musicData.songDispatcher.end();
  }
};
