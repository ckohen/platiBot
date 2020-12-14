'use strict';

module.exports = (comp, streamData) => comp
  .setTitle(streamData.status)
  .setColor('live')
  .setAuthor(`${streamData.display_name}`,"", streamData.url)
  .setURL(streamData.url)
  .setThumbnail(streamData.logo)
  .addField("Category", streamData.game || "No game", true)
  .addField("Followers", streamData.followers || "Unknown", true)
  .setImage(streamData.profile_banner)
  .setTimestamp(Date.now());