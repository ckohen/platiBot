module.exports =  {
  channel: 'music',
      name: 'skipto',
      description: 'Skip to a specific song in the queue, provide the song number as an argument',
      role: 'DJ',
      args: true,
      usage: '<song number>',

  async run(socket, message, args) {
    songNumber = Number(args.join(' '));
    let musicData = socket.musicData.get(String(message.guild.id));
    if (songNumber < 1 || songNumber > musicData.queue.length + 1) {
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

    if (musicData.queue < 1)
      return message.reply('There are no songs in queue');

    musicData.queue.splice(0, songNumber - 1);
    musicData.songDispatcher.end();
    return;
  }
};
