module.exports = (comp, member, prefix) => comp
      .setColor('aqua')
      .setTitle("Game Rooms")
      .setDescription(`These rooms are designed to help keep track of who is playing with who and allow members to wait for an available spot. Join any waiting list by using \`${prefix}room join <room id>\` (You can join multiple waiting lists!)`)
      .setFooter("Requested by " + member.user.username);