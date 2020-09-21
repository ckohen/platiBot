const { Collection } = require("discord.js");

module.exports = {
    permissions: 'MOVE_MEMBERS',
    description: 'Randomly moves a specifed number of users between vcs',
    args: true,
    aliases: ['randmove'],
    usage: [
        'to [string name of channel to always move to]',
        'from [string name of channel to always move from]',
        '<number> [string name of channel to move to]',
        '<number> [string name of channel to move from] -> [string name of channel to move to]'
    ],

    async run(socket, message, args) {
        const commandPrefix = socket.prefixes.get(String(message.guild.id)).prefix;
        const routines = ['to', 'from', 'move'];

        let methodRaw = args.shift();
        let method = Number(methodRaw) ? "move" : methodRaw.toLowerCase();

        if (!routines.includes(method) || methodRaw.toLowerCase() == "move") {
            return message.reply("Specifiy a valid number of people or `to` or `from` to specify a permanent channel setting!");
        }

        // A list of key value pairs with stored channels for each guild
        let settings = socket.randomSettings.get(String(message.guild.id));

        if (typeof settings == 'undefined' || settings == null) {
            socket.randomSettings.set(String(message.guild.id), { guildID: String(message.guild.id), to: "", from: "" });
            await socket.app.database.addRandom(String(message.guild.id));
            settings = socket.randomSettings.get(String(message.guild.id));
        }

        let voiceChannel;
        let newChannel;
        let editChannel;
        let toChannel;
        let moving;
        let num;

        switch (method) {
            case 'to':
                // Find the channel if it exists and store it
                editChannel = message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.join(' ').toLowerCase());
                // Remove channel if the requested channel does not exist
                if ((typeof editChannel == 'undefined' || editChannel == null)) {
                    settings.to = "";
                    await socket.app.database.editRandom(String(message.guild.id), settings.to, settings.from);
                    return message.reply('There is no longer a permanent random move **to** channel set!');
                }
                settings.to = String(editChannel.id);
                await socket.app.database.editRandom(String(message.guild.id), settings.to, settings.from);
                return message.reply(`Permanent random move **to** channel is now ${editChannel.name}`);
            case 'from':
                // Find the channel if it exists and store it
                editChannel = message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.join(' ').toLowerCase());
                // Remove channel if the requested channel does not exist
                if ((typeof editChannel == 'undefined' || editChannel == null)) {
                    settings.from = "";
                    await socket.app.database.editRandom(String(message.guild.id), settings.to, settings.from);
                    return message.reply('There is no longer a permanent random move **from** channel set!');
                }
                settings.from = String(editChannel.id);
                await socket.app.database.editRandom(String(message.guild.id), settings.to, settings.from);
                return message.reply(`Permanent random move **from** channel is now ${editChannel.name}`);
            case 'move':
                num = Number(methodRaw);
                if (settings.to.length > 0) {
                    newChannel = await message.member.guild.channels.cache.get(settings.to);
                    toChannel = `Stored, change with \`${commandPrefix}randmove to <channel>\`,`;
                }
                if (settings.from.length > 0) {
                    voiceChannel = await message.member.guild.channels.cache.get(settings.from);
                    fromChannel = `Stored, change with \`${commandPrefix}randmove from <channel>\`,`;
                }
                // Move users in curent channel
                if (args.indexOf("->") < 0) {
                    // Check if voice channel
                    if (!voiceChannel) voiceChannel = message.member.voice.channel;
                    if (!voiceChannel) return message.reply(`Join a channel or specify a from channel with \`${commandPrefix}randmove <number> <from> -> <to>\` or \`${commandPrefix}readmove from <channel>\` and try again`);

                    // If specified, use the override instead
                    if (args.length > 0) {
                        toChannel = args.join(' ');
                        // Check for new channel
                        newChannel = await message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === toChannel.toLowerCase() && channel.type === "voice");
                    }
                    if (!newChannel) return message.reply(`Specify a channel with \`${commandPrefix}randmove <number> <to>\` or \`${commandPrefix}readmove to <channel>\` and try again`)
                }
                // Move users in specified channel
                else {
                    let fromChannel = args.slice(0, args.indexOf("->")).join(' ');
                    toChannel = args.slice(args.indexOf("->") + 1).join(' ');
                    voiceChannel = await message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === fromChannel.toLowerCase() && channel.type === "voice");
                    newChannel = await message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === toChannel.toLowerCase() && channel.type === "voice");
                }
                if (0 < num < voiceChannel.members.size) {
                    moving = voiceChannel.members.filter(member => !member.user.bot).random(num);
                }
                else {
                    moving = voiceChannel.members;
                    num = "all";
                }
                break;
            default:
                ;
        }


        let confMsg;


        if (newChannel && voiceChannel) {
            // Move members
            moving.forEach(member => {
                member.voice.setChannel(newChannel).catch((err) => {
                    socket.app.log.out('error', module, err);
                });
            });
            confMsg = await message.channel.send(`Randomly moving ${num} voice members to ` + newChannel.name);
        }
        else if (newChannel) {
            confMsg = await message.reply(fromChannel + " is not a valid voice channel!");
        }
        else {
            confMsg = await message.reply(toChannel + " is not a valid voice channel!");
        }
        message.delete()
        confMsg.delete({ timeout: 3000 });
    }
};