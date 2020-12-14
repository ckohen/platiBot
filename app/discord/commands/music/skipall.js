module.exports = {
  channel: 'music',
  name: 'skipall',
  aliases: ['skip-all', 'queue-clear', 'clearq', 'clear-q'],
  description: 'Skip all songs in queue',
  role: 'DJ',

  async run(socket, message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    let musicData = socket.musicData.get(String(message.guild.id));
    if (
      typeof musicData.songDispatcher == 'undefined' ||
      musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }
    if (!musicData.queue)
      return message.reply('There are no songs in queue');
    musicData.queue.length = 0; // clear queue
    return message.reply("The queue has been cleared!");
  }
};
