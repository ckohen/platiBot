const { MessageEmbed } = require('discord.js');

module.exports = {
  channel: 'music',
  name: 'queue',
  aliases: ['song-list', 'next-songs', 'q'],
  description: 'Display the song queue',

  async run(socket, message) {
    if (socket.musicData.queue.length == 0)
      return message.reply('There are no songs in queue!');
    const titleArray = [];
    /* eslint-disable */
    // display only first 10 items in queue
    socket.musicData.queue.slice(0, 10).forEach(obj => {
      titleArray.push(obj.title);
    });
    /* eslint-enable */
    var queueEmbed = socket.getEmbed('queue', [socket.musicData.queue]);
    for (let i = 0; i < titleArray.length; i++) {
      queueEmbed.addField(`${i + 1}:`, `${titleArray[i]}`);
    }
    return message.channel.send(queueEmbed);
  }
};
