module.exports = (comp, member, prefix = "!") => comp
      .setColor('red')
      .setTitle("Voice Roles")
      .setDescription("This is a list of voice roles that users will be assigned when in a specific channel. Use `" + prefix + "help voice` to see instructions for how to edit the voice roles.")
      .setFooter("Requested by " + member.user.username);