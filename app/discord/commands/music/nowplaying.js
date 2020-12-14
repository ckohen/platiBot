const { MessageEmbed } = require('discord.js');

module.exports = {
  channel: 'music',
  name: 'nowplaying',
  aliases: ['np', 'currently-playing', 'now-playing'],
  description: 'Display the currently playing song',

  async run(socket, message) {
    let musicData = socket.musicData.get(String(message.guild.id));
    if (!musicData.isPlaying && !musicData.nowPlaying) {
      return message.reply('There is no song playing right now!');
    }

    const video = musicData.nowPlaying;
    let description;
    if (video.duration == 'Live Stream') {
      description = 'Live Stream';
    } else {
      description = playbackBar(musicData, video);
    }

    videoEmbed = socket.getEmbed('videoEmbed', [video, description]);
    
    message.channel.send(videoEmbed);
    return;
  }
};

function playbackBar(data, video) {
  const passedTimeInMS = data.songDispatcher.streamTime - data.songDispatcher.pausedTime;
  const passedTimeInMSObj = {
    seconds: Math.floor((passedTimeInMS / 1000) % 60),
    minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
    hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24)
  };
  const passedTimeFormatted = formatDuration(
    passedTimeInMSObj
  );

  const totalDurationObj = video.rawDuration;
  const totalDurationFormatted = formatDuration(
    totalDurationObj
  );

  let totalDurationInMS = 0;
  Object.keys(totalDurationObj).forEach(function (key) {
    if (key == 'hours') {
      totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;
    } else if (key == 'minutes') {
      totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
    } else if (key == 'seconds') {
      totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 100;
    }
  });
  const playBackBarLocation = Math.round(
    (passedTimeInMS / totalDurationInMS) * 10
  );
  let playBack = '';
  for (let i = 1; i < 21; i++) {
    if (playBackBarLocation == 0) {
      playBack = ':musical_note:▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
      break;
    } else if (playBackBarLocation == 10) {
      playBack = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬:musical_note:';
      break;
    } else if (i == playBackBarLocation * 2) {
      playBack = playBack + ':musical_note:';
    } else {
      playBack = playBack + '▬';
    }
  }
  playBack = `${passedTimeFormatted}  ${playBack}  ${totalDurationFormatted}`;
  return playBack;
}
// prettier-ignore

function formatDuration(durationObj) {
  const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
    durationObj.minutes ? durationObj.minutes : '00'
    }:${
    (durationObj.seconds < 10)
      ? ('0' + durationObj.seconds)
      : (durationObj.seconds
        ? durationObj.seconds
        : '00')
    }`;
  return duration;
}