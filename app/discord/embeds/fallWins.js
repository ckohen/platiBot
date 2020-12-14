module.exports = (comp, prefix, username) => comp
      .setThumbnail('https://pbs.twimg.com/profile_images/1267772036128145409/VL78Nlyj_200x200.png')
      .setColor('blue')
      .setTitle("Fall Guys W Tracker")
      .setDescription("Use " + prefix + "addwin to add a win to yourself, or " + prefix + "setwins [number] if you aren't on the list and have multiple wins")
      .setFooter("Last updated" + (username ? ` by ${username}`: ""))
      .setTimestamp(Date.now());

