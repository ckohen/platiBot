'use strict';

module.exports = {
  channel: 'commandManagement',
  usage: ['(add|edit) <command> <response>', 'rename <old> <new>', 'delete <command>', 'level <command> <lowest required user level>'],

  async run(socket, message, args) {
    const routines = ['add', 'edit', 'rename', 'delete', 'level'];
    const levels = ['broadcaster', 'moderator', 'vip', 'everyone'];

    const [actionRaw, inputRaw, ...outputRaw] = args;
    const action = actionRaw ? actionRaw.toLowerCase() : null;
    const input = inputRaw ? inputRaw.replace(/^[\W]+/g, '').trim() : null;
    const output =
      outputRaw.length > 0
        ? outputRaw
            .join(' ')
            .replace(/^['"]+|['"]+$/g, '')
            .trim()
        : null;

    const send = (content, mention = false) => {
      if (!content) return;
      const target = mention ? `, ${message.author}` : '';
      message.channel.send(`${content}${target}.`).catch(err => {
        socket.app.log.error(module, err);
      });
    };

    const respond = content => send(content, true);

    if (!routines.includes(action)) {
      respond('Specify a valid subroutine');
      return;
    }
    if (!input) {
      respond('Provide a command name');
      return;
    }

    const prefixBool = inputRaw.charAt(0) === '!';
    const prefix = prefixBool ? '!' : '';

    const command = socket.app.twitch.irc.commands.get(input + (prefixBool ? '-1' : '-0'));

    if (command && command.locked) {
      respond("That command is locked and can't be modified");
      return;
    }

    let data = null;
    let method = null;
    let submethod = null;
    let failure = null;
    let success = null;

    switch (action) {
      // Add command
      case 'add':
        if (command) {
          respond('That command already exists');
          return;
        }
        if (!output) {
          respond('Provide a command response');
          return;
        }
        method = 'add';
        data = [input, output, prefixBool ? 1 : 0];
        success = `Command \`${prefix}${input}\` added`;
        failure = "Couldn't add command. Please try again";
        break;
      // Edit command
      case 'edit':
        if (!command) {
          respond("That command doesn't exist. Try adding it");
          return;
        }
        if (!output || output === command.output) {
          respond('Provide an updated command response');
          return;
        }
        method = 'edit';
        submethod = 'output';
        data = [command.id, output];
        success = `Command \`${prefix}${input}\` updated`;
        failure = "Couldn't edit command. Please try again";
        break;
      // Rename command
      case 'rename':
        if (!command) {
          respond("That command doesn't exist");
          return;
        }
        if (!output || output === command.input) {
          respond('Provide a new command name');
          return;
        }
        method = 'edit';
        submethod = 'rename';
        data = [command.id, output];
        success = `Command \`${prefix}${input}\` renamed to \`${prefix}${output}\``;
        failure = "Couldn't rename command. Please try again";
        break;
      // Delete command
      case 'delete':
        if (!command) {
          respond("That command doesn't exist");
          return;
        }
        method = 'delete';
        data = [command.id];
        success = `Command \`${prefix}${input}\` deleted`;
        failure = "Couldn't delete command. Please try again";
        break;
      // Edit command level
      case 'level':
        if (!command) {
          respond("That command doesn't exist. Try adding it");
          return;
        }
        if (!output || output.toLowerCase() === command.restriction) {
          respond('Provide an updated user level requirenment');
          return;
        }
        if (!levels.includes(output)) {
          respond('Specify a valid user level');
          return;
        }
        method = 'edit';
        submethod = 'restriction';
        data = [command.id, output.toLowerCase()];
        success = `Command Level for \`${prefix}${input}\` updated`;
        failure = "Couldn't edit command. Please try again";
        break;
      default:
        return;
    }

    if (!method || !data) return;

    try {
      if (method === 'edit') {
        await socket.app.database[method]('ircCommands', submethod, data);
      } else {
        await socket.app.database[method]('ircCommands', data);
      }
    } catch (err) {
      socket.app.log.error(module, err);
      respond(failure);
      return;
    }

    await socket.app.twitch.irc.cacheCommands();

    send(success);
  },
};
