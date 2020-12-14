module.exports = (comp, message, Msg) => comp
      .setThumbnail(message.member ? message.member.user.displayAvatarURL() : null)
      .setColor('orange')
      .setTitle(message.member ? message.member.user.tag : "Failed to get user tag")
      .addField("Message Deleted", Msg || "Unable to get message content.")
      .setDescription(`${message.member}'s message in ${message.channel} was deleted.`)
      .setTimestamp(Date.now());