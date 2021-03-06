'use strict';

const BaseAppCommand = require('./BaseAppCommand');

class ColorAppCommand extends BaseAppCommand {
  constructor(socket) {
    const info = {
      definition: {
        name: 'color',
        description: 'changes your color in this server',
        options: [
          {
            type: 8,
            name: 'color',
            description: 'the role with the color you want',
          },
        ],
      },
    };
    super(socket, info);
  }

  async run(interaction, args) {
    // Get the current guild from the colorManager
    let guild = this.socket.cache.colorManager.get(String(interaction.guildID));
    if (!guild) {
      interaction.reply('This command does not work without a bot in the server or in DMs.', { ephemeral: true });
      return;
    }

    // An array of snowflakes for all the available color roles to remove all color roles before assigning a new one
    let colorSnowflakes = guild.snowflakes.filter(id => interaction.guild.roles.resolve(id) !== null);

    // Set user to command sender
    let member = interaction.member;

    // Set role if it exists
    let roleID = args?.find(arg => arg.name === `color`)?.value;

    if (colorSnowflakes.includes(roleID) || typeof args === `undefined`) {
      // Remove all predefined colors *Does not remove specialty colors*
      await member.roles.remove(colorSnowflakes);
      if (typeof args === `undefined`) {
        interaction.reply(`Your color has been removed.`, { ephemeral: true });
      } else {
        // Add the role requested
        const assigned = await member.roles.add(roleID).catch(() => false);
        if (!assigned) {
          interaction.reply(`I was unable to assign <@&${roleID}>, please contact a mod to ensure all permissions are adequate.`, {
            ephemeral: true,
          });
        } else {
          // Notify user of role addition
          interaction.reply(`Your color has been changed t0o <@&${roleID}>.`, { ephemeral: true });
        }
      }
    } else {
      // If the role is invalid, notify user
      interaction.reply(`<@&${roleID}> isn't a valid color role.`, { ephemeral: true });
    }
  }
}

module.exports = ColorAppCommand;
