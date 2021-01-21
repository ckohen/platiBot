'use strict';

module.exports = (socket, message) => {
  if (message.partial) {
    socket.app.log.verbose(module, `Recieved partial message in delete event:${message.id}`);
    return;
  }

  if (message.author.bot) {
    return;
  }

  if (message.content.length > 900) {
    message.content = '**Too long to show!**';
  }

  let embed = socket.getEmbed('messageRemove', [message, message.content]);

  if (socket.isGuild(message.guild.id, 'platicorn')) {
    socket.sendWebhook('msgDelete', embed);
  } else if (message.guild.id === '756319910191300778') {
    socket.sendMessage('helpLogs', embed);
  }
};