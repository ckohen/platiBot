'use strict';

module.exports = socket => {
  if (!socket.app.ending) {
    setTimeout(() => {
      socket.driver.listen(socket.app.options.http.port).catch(err => {
        socket.app.log.out('error', module, `Listen: ${err}`);
      });
    }, 5000);
  }
};
