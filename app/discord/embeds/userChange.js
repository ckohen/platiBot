module.exports = (comp, type, member, before, after) => comp
      .setThumbnail(member.user.displayAvatarURL())
      .setColor('cyan')
      .setTitle(member.user.tag)
      .addField(type, before + " **=>** " + after)
      .setDescription(`${member}'s ` + type + " has been updated!")
      .setTimestamp(Date.now());