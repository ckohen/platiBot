'use strict';

module.exports = {
  colors: {
    aqua: 0x2EC6CC,
    gold: 0xFFAB32,
    green: 0x2ECC71,
    purple: 0x8A54ED,
    red: 0xC8003A,
    delete: 0x01B8C3,
    twitch: 0x9146FF,
    live: 0xFF0000,
    play: 0xE9F931,
    queue: 0xFF7373,
    songSearch: 0xE9F931,
    videoEmbed: 0xE9F931,

    pink: 0xFF0080,
    red: 0xFF0000,
    orange: 0xFF8000,
    yellow: 0xFFFF00,
    green: 0x00FF00,
    cyan: 0x00FFFF,
    blue: 0x0080FF,
    purple: 0x8000FF,

  },
  token: process.env.DISCORD_TOKEN,
  options: {
    partials: ['MESSAGE', 'REACTION'],
  }
  ,
};
