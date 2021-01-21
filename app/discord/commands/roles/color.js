'use strict';

const BaseCommand = require('../BaseCommand');

class ColorsCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'color',
      description: 'color [The color from the predefined list of colors]',
      usage: '<color-role-name>',
      args: true,
    };
    super(socket, info);
  }

  run(socket, message, args) {
    args = args.join(' ');

    // Get the current guild from the colorManager
    let guild = socket.colorManager.get(String(message.guild.id));
    // A list of key value pairs with channels and available roles
    let channelName = guild.roles;

    // An array of snowflakes for all the available color roles to remove all color roles before assigning a new one
    let colorSnowflakes = guild.snowflakes;

    // If a role from a valid channel is typed in that channel add the role to the user
    if (channelName[String(message.channel.id)]) {
      roleAssign(socket, message, channelName[String(message.channel.id)], colorSnowflakes, args);
    } else {
      message.delete();
    }
  }
}

// Role manager
async function roleAssign(socket, message, validRoles, colorSnowflakes, args) {
  // Convert role request to lower case for comparison
  let roleName = args.toLowerCase();
  // Set user to command sender
  let member = message.member;

  // If roleName is a valid role within the channel
  let roleAssigned = false;

  if (validRoles.indexOf(roleName) > -1) {
    // Remove all predefined colors *Does not remove specialty colors*
    await member.roles.remove(colorSnowflakes);
    if (roleName === 'remove') {
      message.channel.send(`Your color has been removed, ${member}`);

      socket.app.log.verbose(module, `Removed ${member.user.username}'s color`);
    } else {
      // Find the role within the discord server
      let role = message.guild.roles.cache.find(roles => roles.name.toLowerCase() === roleName.toLowerCase());
      // Add the role requested
      await member.roles.add(role);

      socket.app.log.verbose(module, `Changed ${member.user.username}'s color to ${role.name}`);

      // Notify user of role addition
      roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
      message.channel.send(`Your color has been changed to ${roleName}, ${member}`);
    }
    roleAssigned = true;
  } else {
    // If the role is invalid in the channel, notify user
    roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
    message.channel.send(`${roleName} isn't a valid color, ${member}`);
    roleAssigned = false;
  }

  // Deletes command and resopne messages after 3 seconds
  setTimeout(() => message.channel.bulkDelete(2), 3000);

  return roleAssigned;
}

module.exports = ColorsCommand;