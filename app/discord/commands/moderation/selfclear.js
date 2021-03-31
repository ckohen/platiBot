'use strict';

const { clamp, discord } = require('../../../util/UtilManager');
const BaseCommand = require('../BaseCommand');

class SelfClearCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'selfclear',
      usage: '<amount:1-100>',
      guild: 'platicorn',
    };
    super(socket, info);
  }

  async run(message, [amountRaw]) {
    const validChannels = ['732322543607873640', '733885058754150431', '541307689674735637', '701328121106006047'];
    if (!validChannels.includes(message.channel.id)) {
      return;
    }

    const amount = parseInt(amountRaw, 10);

    // No numeric amount given
    if (Number.isNaN(amount)) {
      message.channel.send(`Provide an amount to clear, ${message.author}.`).catch(err => {
        this.socket.app.log.error(module, err);
      });
      return;
    }

    // Get users messages
    const toClear = message.channel.messages.cache.filter(msg => msg.author.id === message.author.id);
    toClear.sort(snowflakeSort);
    if (toClear.size < amount) {
      let olderMessages = await message.channel.messages.fetch(
        {
          message: {
            before: toClear.first().id,
            limit: 100,
          },
        },
        false,
      );
      olderMessages = olderMessages.filter(msg => msg.author.id === message.author.id);
      olderMessages.forEach(msg => toClear.set(msg.id, msg));
      toClear.sort(snowflakeSort);
    }

    // Clear messages
    message.channel
      .bulkDelete(toClear.last(clamp(amount + 1, 2, 100)), true)
      .then(deleted => {
        this.socket.app.log.debug(module, `Deleted ${deleted.size} messages`);
      })
      .catch(err => {
        this.socket.app.log.warn(module, err);
      });
    if (discord.isGuild(message.guild.id, 'platicorn', this.socket.app.settings)) {
      this.socket.sendWebhook('clear', `**${message.member.displayName}** self cleared **${amount}** line(s) in ${message.channel}.`);
    } else if (message.guild.id === '756319910191300778') {
      this.socket.sendMessage('helpLogs', `**${message.member.displayName}** self cleared **${amount}** line(s) in ${message.channel}.`);
    }
  }
}

function snowflakeSort(msgA, msgB) {
  if (BigInt(msgA.id) > BigInt(msgB.id)) {
    return 1;
  } else if (BigInt(msgA.id) < BigInt(msgB.id)) {
    return -1;
  } else {
    return 0;
  }
}

module.exports = SelfClearCommand;
