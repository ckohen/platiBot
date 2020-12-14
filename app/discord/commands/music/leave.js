module.exports = {
  channel: 'music',
  name: 'leave',
  aliases: ['end'],
  description: 'Leaves voice channel if in one',
  role: 'DJ',

  async run(socket, message) {
    var voiceChannel = message.member.voice.channel;
    let musicData = socket.musicData.get(String(message.guild.id));
    if (!voiceChannel) {
      message.reply('Join a channel and try again');
      return;
    } else if (
      typeof musicData.songDispatcher == 'undefined' ||
      musicData.songDispatcher == null
    ) {
      message.reply('There is no song playing right now!');
      return;
    } else if (!musicData.queue) {
      message.reply('There are no songs in queue');
      return;
    } else if (musicData.songDispatcher.paused) {
      musicData.songDispatcher.resume();
      setTimeout(() => {
        musicData.songDispatcher.end();
      }, 100);
      musicData.queue.length = 0;
      return;
    } else {
      musicData.songDispatcher.end();
      musicData.queue.length = 0;
      return;
    }
  }
};
