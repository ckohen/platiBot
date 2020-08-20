module.exports = {
  channel: 'music',
      name: 'remove',
      description: 'Remove a specific song from queue',
      args: true,
      role: 'DJ',
      usage: '<song number to delete>',

  async run(socket, message, args) {
    songNumber = Number(args.join(' '));
    if (songNumber < 1 || songNumber >= socket.musicData.queue.length) {
      return message.reply('Please enter a valid song number');
    }
    var voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof socket.musicData.songDispatcher == 'undefined' ||
      socket.musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }

    socket.musicData.queue.splice(songNumber - 1, 1);
    return message.channel.send(`Removed song number ${songNumber} from queue`);
  }
};
