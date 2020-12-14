'use strict';

module.exports = (comp, streamData, game, duration) => comp
  .setTitle("Thank You For The Fun Stream!")
  .setColor('twitch')
  .setAuthor(`${streamData.display_name}`,"", streamData.url)
  .setThumbnail(streamData.logo)
  .addField("OFFLINE", `Played ${game} ${duration}`, true)
  .setImage(streamData.profile_banner)
  .setTimestamp(Date.now());
