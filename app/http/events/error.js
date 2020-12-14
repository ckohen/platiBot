'use strict';

module.exports = (socket, error) => {
  let level = 'error';

  // Demote socket connection fluctuation warnings
  if (error.message.includes('ECONNRESET') || error.code === 'ECONNRESET') {
    level = 'info';
  }
  if (error.message.includes('EADDIRUSE') || error.code === 'EADDIRUSE') {
      socket.driver.close();
  }

  const message = error.message || JSON.stringify(error);

  socket.app.log.out(level, module, message);
};
