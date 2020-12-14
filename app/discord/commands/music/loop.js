module.exports = {
  channel: 'music',
  name: 'loop',
  description: 'Loop the current playing song',
  args: true,
  role: 'DJ',
  usage: "<amount>",

  async run(socket, message, args) {
    numOfTimesToLoop = Number(args.join(' '));
    let musicData = socket.musicData.get(String(message.guild.id));
    if (!musicData.isPlaying) {
      return message.reply('There is no song playing right now!');
    }

    for (let i = 0; i < numOfTimesToLoop; i++) {
      musicData.queue.unshift(musicData.nowPlaying);
    }

    // prettier-ignore
    message.channel.send(
      `${musicData.nowPlaying.title} looped ${numOfTimesToLoop} ${
      (numOfTimesToLoop == 1) ? 'time' : 'times'
      }`
    );
    return;
  }
};
