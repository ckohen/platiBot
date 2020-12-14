module.exports = (comp, member, role, type) => comp
      .setThumbnail(member.user.displayAvatarURL())
      .setColor('purple')
      .setTitle(member.user.tag)
      .addField("Role", `${role} was  **` + type + "**.")
      .setDescription(`${member}'s roles have been updated!`)
      .setTimestamp(Date.now());