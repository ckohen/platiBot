module.exports = {
  channel: 'music',
      name: 'remove',
      description: 'Remove a specific song from queue',
      args: true,
      role: 'DJ',
      usage: '<song number to delete>',

  async run(socket, message, args) {
    songNumber = Number(args.join(' '));
    let musicData = socket.musicData.get(String(message.guild.id));
    if (songNumber < 1 || songNumber >= musicData.queue.length) {
      return message.reply('Please enter a valid song number');
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof musicData.songDispatcher == 'undefined' ||
      musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }

    musicData.queue.splice(songNumber - 1, 1);
    return message.channel.send(`Removed song number ${songNumber} from queue`);
  }
};
