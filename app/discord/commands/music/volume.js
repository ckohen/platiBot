module.exports = {
  channel: 'music',
      name: 'volume',
      aliases: ['change-volume'],
      description: 'Adjust song volume',
      role: 'DJ',
      usage: '[volume: 1-200]',

  async run(socket, message, args) {
    wantedVolume = Number(args[0]);
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    let musicData = socket.musicData.get(String(message.guild.id));
    if (
      typeof musicData.songDispatcher == 'undefined' ||
      musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }
    if (wantedVolume <= 100 && wantedVolume >= 0) {
      const volume = wantedVolume / 100;
      musicData.volume = volume;
      musicData.songDispatcher.setVolume(volume);
      try {
        socket.app.database.editVolume(String(message.guild.id), volume);
      } catch (err) {
        socket.app.log.out('error', module, err);
      }
      message.channel.send(`I set the volume to: ${wantedVolume}%`);
    } else {
      message.reply(`The current volume is ${musicData.volume * 100}%`)
    }
  }
};
