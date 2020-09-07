'use strict';

module.exports = (socket, message) => {
  // Ignore bots
  if (message.author.bot) return;

  // React only in guild text channels
  if (message.channel.type !== 'text') return;

  const { commandPrefix } = socket.app.options.discord;

  // Delete all messages except specified messages in tracker channels
  if (message.channel.name === "fall-guys-tracker") {
    if (!message.content.startsWith("!addwin") && !message.content.startsWith("!setwins")) {
      message.delete();
      return;
    }
  }

  // Check for commands
  if (!message.content.startsWith(commandPrefix)) return;

  // Separate arguments from command
  const args = message.content.slice(commandPrefix.length).trim().split(/\s+/g);
  const command = args.shift().toLowerCase();

  // Check for handler or aliases
  const handler = socket.commands.get(command)
    || socket.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

  if (!handler) return;

   // Check for guild constraints
   if (handler.guild && !socket.isGuild(message.guild.id, handler.guild)) return;

  // Check for channel constraints
  if (handler.channel && !socket.isChannel(message.channel.id, handler.channel)) return;

  // Check for role constraints
  if (handler.role && !message.member.roles.some((role) => role.name === handler.role)) {
    if (!message.member.hasPermission("MANAGE_ROLES", false, true, true)) {
      message.channel.send(`You're not allowed to do that, ${message.author}.`).catch((err) => {
        socket.app.log.out('error', module, err);
      });
      return;
    }
  }

  // Check permissions
  if (handler.permissions && !message.member.hasPermission(handler.permissions)) {
    message.channel.send(`You're not allowed to do that, ${message.author}.`).catch((err) => {
      socket.app.log.out('error', module, err);
    });
    return;
  }

  // Check arguments
  if (handler.args && !args[0]) {
    message.channel.send(`That command requires an argument, ${message.author}.`).catch((err) => {
      socket.app.log.out('error', module, err);
    });
    return;
  }

  // Handle command
  handler.run(socket, message, args);
};
