module.exports = (comp, message, oldMsg, newMsg) => comp
      .setThumbnail(message.member.user.displayAvatarURL())
      .setColor('blue')
      .setTitle(message.member.user.tag)
      .addField("Message Edited", oldMsg + " **=>** " + newMsg)
      .setDescription(`${message.member} edited a message in ${message.channel}.`)
      .setTimestamp(Date.now());