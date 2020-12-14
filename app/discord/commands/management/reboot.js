'use strict';

module.exports = {
  channel: 'console',

  async run(socket, message) {
    socket.app.log.out('info', module, 'Reboot instruct received');

    await message.channel.send('Rebooting now!').catch((err) => {
      socket.app.log.out('error', module, err);
    });

    // Reboot
    socket.app.end(0);
  },
};
