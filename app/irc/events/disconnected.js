'use strict';

module.exports = (socket, reason) => {
  if (!socket.app.ending) {
    socket.app.log.out('warn', module, `Disconnected: ${reason}, attempting reconnect...`);
  }
};
