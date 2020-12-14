'use strict';

const twitch = require('../util');
const handlers = require('../handlers');

module.exports = (socket, channel, user, messageRaw, self) => {
  // Ignore self
  if (self) return;

  const message = messageRaw.trim();
  const opts = socket.app.options.twitch;
  const isVip = twitch.isVip(user);
  const isPrivileged = twitch.isPrivileged(user, opts.channel);
  const isBroadcaster = twitch.isBroadcaster(user, opts.channel);


  // Check for moderation filters
  const filter = socket.filters.find((item) => new RegExp(item.input, 'gi').test(message));

  if (filter && !isPrivileged) {
    // Handle moderation
    const { action, duration } = handlers.moderation(socket, channel, user, message, filter);

    // Log moderation
    socket.logModeration(filter.id, action, user.username, user['user-id'], duration, message);

    return;
  }

  // Separate arguments from command
  const args = message.trim().split(/\s+/g);
  let input = args.shift().toLowerCase();

   // Listen for commands
   if (!message.startsWith(opts.commandPrefix)) {
     input = input + "-0";
   } 
   else {
     input = input.slice(opts.commandPrefix.length) + "-1";
   }

  // Check for existing commands
  let command = socket.commands.get(input);

  if (!command) {
    if (message.indexOf("bonk") > -1) {
      command = socket.commands.get("bonk-0");
    } else {
      return;
    }
  }

  if (command.level === "broadcaster" && !isBroadcaster) {
    return;
  }

  if (command.level === "moderator" && !isPrivileged) {
    return;
  }

  if (command.level === "vip" && !(isPrivileged || isVip)) {
    return;
  }

  if (isPrivileged || isVip) {
    // Handle immediately if user is privileged or VIP
    handlers.command(socket, channel, user, command, input, args, isBroadcaster, isPrivileged, isVip);
    return;
  }

  // Throttle command usage
  socket.throttle.rateLimit(input, (err, limited) => {
    if (err) return socket.app.log.out('error', module, `Throttle: ${err}`);
    if (limited) return socket.app.log.out('debug', module, `Throttled command: ${input}`);

    // Handle command
    handlers.command(socket, channel, user, command, input, args);
  });
};
