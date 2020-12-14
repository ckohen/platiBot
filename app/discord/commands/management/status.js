'use strict';

const cache = require('memory-cache');

const { humanBytes, humanDuration } = require.main.require('./app/util/helpers');

module.exports = {
  channel: 'console',

  run(socket, message) {
    const { irc, settings } = socket.app;
    const { rss, heapUsed } = process.memoryUsage();

    const status = [
      `Uptime: **${humanDuration(process.uptime() * 1000)}**`,
      `Memory: **${humanBytes(rss)}** total, **${humanBytes(heapUsed)}** heap`,
      `State: **${settings.size}** settings, **${irc.filters.size}** filters, **${irc.commands.size}** commands`,
      `Cache: **${cache.size()}** items`,
    ];

    message.channel.send(status).catch((err) => {
      socket.app.log.out('error', module, err);
    });
  },
};
