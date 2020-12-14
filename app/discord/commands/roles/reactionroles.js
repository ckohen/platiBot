module.exports = {
    name: 'reactionroles',
    description: 'Allows server admins to create a reaction based role manager',
    permissions: 'MANAGE_ROLES',
    aliases: ['reactions', 'rr'],
    usage: [
        '',
        'add <@role> [@role @role etc..]',
        'remove',
        'create',
        '[list]'
    ],

    async run(socket, message, args) {
        const commandPrefix = socket.prefixes.get(String(message.guild.id)).prefix;
        const routines = ['add', 'remove', 'create', 'update', 'list'];

        const [methodRaw, roleRaw, ...extraArgs] = args;
        const method = methodRaw ? methodRaw.toLowerCase() : "list";

        if (!routines.includes(method)) {
            return message.reply('Specify a valid subroutine');
        }

        let roles = [];

        //  A list of key value pairs with channels and available roles
        let guild = socket.reactionRoles.get(String(message.guild.id));

        // Check for actual role
        if (roleRaw && roleRaw.startsWith('<@&') && roleRaw.endsWith('>')) {
            roles[0] = message.guild.roles.cache.get(roleRaw.slice(3, -1));
        }

        // Check for extra roles and specifying makeme or makemenot only
        if (extraArgs) {
            extraArgs.forEach(elem => {
                if (elem.startsWith('<@&') && elem.endsWith('>')) {
                    roles.push(message.guild.roles.cache.get(elem.slice(3, -1)));
                }
            });
        }

        // Limit roles to be below bots highest role
        let botHighest = message.guild.me.roles.highest;
        roles = roles.filter(role => (role.comparePositionTo(botHighest) < 0) && !role.managed);

        let roleNames = [];
        roles.forEach(role => roleNames.push(role.name.toLowerCase()));
        let roleSnowflakes = [];
        roles.forEach(role => roleSnowflakes.push(role.id));

        // Store the existing emojis
        let emojis = Object.keys(guild.roles);
        let emote;
        let create = false;
        let update = false;
        let bot = await socket.driver.user;

        switch (method) {
            case 'add':
                // Catch if no roles are being added
                if (roles.length < 1) {
                    return message.reply("Please provide at least one valid role to add. *The bot must have a higher role than all roles it is assigning!*");
                }
                else if (emojis.length > 19) {
                    return message.reply("There are already 20 sets of reactions roles in this server, plese remove one first.")
                }
                emote = await getEmote(socket, message, roles);
                if (!emote) {
                    return;
                }

                printableEmote = Number(emote) ? await socket.driver.emojis.cache.get(emote) : emote;
                if (emojis.indexOf(String(emote)) > -1) {
                    return message.reply(`${printableEmote} is already in use, please try again and specify a new emote!`);
                }
                else {
                    guild.roles[String(emote)] = roleSnowflakes;
                }
                break;
            case 'remove':
                // There must be a reaction first
                if (emojis.length < 1) {
                    return message.reply("There are no reaction roles yet!")
                }

                emote = await getEmote(socket, message, roles, emojis, false);
                if (!emote) {
                    return;
                }
                printableEmote = Number(emote) ? await socket.driver.emojis.cache.get(emote) : emote;
                if (emojis.indexOf(String(emote)) < 0) {
                    return message.reply(`${printableEmote} is not currently being used for reaction roles!`);
                }
                else {
                    let deleted = false;
                    delete guild.roles[String(emote)];
                    if (Object.keys(guild.roles).length < 1) {
                        let reactionsMsg = await socket.driver.channels.cache.get(guild.channelID).messages.fetch(guild.messageID).catch(err => { });;
                        if (reactionsMsg && (reactionsMsg.author.id == bot.id)) {
                            reactionsMsg.delete();
                            guild.channelID = "";
                            guild.messageID = "";
                            deleted = true;
                        }
                    }
                    await socket.app.database.editReactionRoles(String(message.guild.id), guild.channelID, guild.messageID, guild.roles);
                    return message.reply(`Deleted ${printableEmote} and associated roles from reaction roles.` + (deleted ? "There are no more reactions roles left, the reaction message has been deleted." : ""));
                }
                break;
            case 'create':
                // Check for appropriate permissions
                if (!message.channel.permissionsFor(bot).has(['ADD_REACTIONS', 'SEND_MESSAGES', 'VIEW_CHANNEL', 'USE_EXTERNAL_EMOJIS', 'READ_MESSAGE_HISTORY'])) {
                    message.reply("Unable to generate reaction roles here. Please make sure that I have permission to `Add Reactions` and `Use External Emoji`").then(msg => { msg.delete({ timeout: 5000 }) });
                    message.delete();
                    return;
                }
                if (emojis.length < 1) {
                    message.reply("There are no reaction roles yet!").then(msg => { msg.delete({ timeout: 5000 }) });
                    message.delete();
                    return;
                }

                if (guild.messageID) {
                    confirmMsg = await message.channel.send("The reaction role message already exists in this server, performing this action will erase it. Are you sure? ✅ (yes) or ❌(cancel)");
                    await confirmMsg.react('✅');
                    await confirmMsg.react('❌');
                    let reacted = true;
                    let collected = await confirmMsg.awaitReactions((reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { max: 1, time: 60000, errors: ['time'] })
                        .catch(err => {
                            message.reply("Not a valid reaction, cancelling!");
                            message.delete().then(msg => { confirmMsg.delete().then(confMsg => reacted = false) });
                        });
                    if (!reacted) {
                        return;
                    }

                    // Find the emote id or name depending on if the emote is custom or not
                    reaction = collected.first();
                    if (reaction.emoji.name === '❌') {
                        message.reply('Cancelled!').then(msg => { msg.delete({ timeout: 5000 }) });
                        message.delete();
                        confirmMsg.delete();
                        return;
                    }
                    else {
                        let oldMsg = await socket.driver.channels.cache.get(guild.channelID).messages.fetch(guild.messageID).catch(err => { });;
                        if (oldMsg) {
                            oldMsg.delete();
                        }
                        confirmMsg.delete();
                    }
                }
                create = true;
                break;
            case 'update':
                // Check that there is an existing message
                if (!guild.messageID) {
                    message.reply("There is no reaction role message yet, unable to update it!").then(msg => { msg.delete({ timeout: 5000 }) });
                    message.delete();
                    return;
                }

                // Check to make sure the message still exists
                let oldMsg = await socket.driver.channels.cache.get(guild.channelID).messages.fetch(guild.messageID).catch(err => { });;
                if (!oldMsg) {
                    message.reply("The reaction role message has been deleted, unable to update it!").then(msg => { msg.delete({ timeout: 5000 }) });
                    guild.messageID = "";
                    guild.channelID = "";
                    socket.app.database.editReactionRoles(String(message.guild.id), guild.channelID, guild.messageID, guild.roles);
                    message.delete();
                    return;
                }

                // Check for appropriate permissions
                let chan = await socket.driver.channels.cache.get(guild.channelID);
                if (!chan.permissionsFor(bot).has(['ADD_REACTIONS', 'SEND_MESSAGES', 'VIEW_CHANNEL', 'USE_EXTERNAL_EMOJIS', 'READ_MESSAGE_HISTORY'])) {
                    message.reply("Unable to update reaction roles message, Please make sure that I have permission to `Add Reactions` and `Use External Emoji`").then(msg => { msg.delete({ timeout: 5000 }) });
                    message.delete();
                    return;
                }

                // If there are no longer any roles, delete the message after prompting
                if (emojis.length < 1) {
                    confirmMsg = await message.channel.send("There are no longer any reaction roles assigned, performing this action will erase the message. Are you sure? ✅ (yes) or ❌(cancel)");
                    await confirmMsg.react('✅');
                    await confirmMsg.react('❌');
                    let reacted = true;
                    let collected = await confirmMsg.awaitReactions((reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { max: 1, time: 60000, errors: ['time'] })
                        .catch(err => {
                            message.reply("Not a valid reaction, cancelling!").then(msg => { msg.delete({ timeout: 5000 }) });
                            message.delete().then(msg => { confirmMsg.delete().then(confMsg => reacted = false) });
                        });
                    if (!reacted) {
                        return;
                    }

                    // Find the emote id or name depending on if the emote is custom or not
                    reaction = collected.first();
                    if (reaction.emoji.name === '❌') {
                        message.reply('Cancelled!').then(msg => { msg.delete({ timeout: 5000 }) });
                        message.delete();
                        confirmMsg.delete();
                        return;
                    }
                    else {
                        message.delete();
                        if (oldMsg) {
                            oldMsg.delete();
                        }
                        confirmMsg.delete();
                    }
                    return;
                }
                create = true;
                update = oldMsg;
                break;
            case 'list':
            default:
                ;
        }


        await socket.app.database.editReactionRoles(String(message.guild.id), guild.channelID, guild.messageID, guild.roles);

        emojis = Object.keys(guild.roles);
        // Create base embed
        let msg = socket.getEmbed('reactionRoles', [message.member, commandPrefix]);
        if (create) {
            msg.setDescription("React to this message with one of the emotes specified below to recieve all the roles listed below it");
            msg.setFooter("");
        }
        if (emojis.length < 1) {
            return message.channel.send("**No reactions specified yet**", msg);
        }
        // Variables for counting to limt
        let fields = 0;
        let lines = 0;
        // Variables to store looped information
        let roleObj;
        let outRoles = [];
        // Loop through each emoji found
        for (emoteID of emojis) {
            lines = 0;
            printableEmote = Number(emoteID) ? await socket.driver.emojis.cache.get(emoteID) : emoteID;

            // Get role objects so discord can embed properly
            guild.roles[emoteID].forEach(id => {
                roleObj = message.guild.roles.cache.get(id);
                outRoles.push(roleObj);
            });

            // Create and send embeds
            if (outRoles.length > 40) {
                for (i = 1; i <= Math.ceil(outRoles.length / 40); i++) {
                    if (fields < 24) {
                        msg.addField(printableEmote, outRoles.slice((i - 1) * 40, i * 40).join("\n"), true);
                        fields += 1;
                    }
                    else {
                        fields = 0;
                        message.channel.send(msg);
                        msg = socket.getEmbed('reationRoles', [message.member, commandPrefix]);
                        if (create) {
                            msg.setDescription("");
                            msg.setTitle("");
                            msg.setFooter("");
                        }
                    }
                }
            }
            else if (outRoles.length > 0) {
                msg.addField(printableEmote, outRoles.join('\n'), true);
                fields += 1;
            }
            // Clear arrays
            outRoles = [];
        }
        let reactionMsg;
        if (!update) {
            // Send the message
            reactionMsg = await message.channel.send(msg);
        }
        else {
            // If the message was sent by the bot, update the embed, otherwise just use the authors message.
            if (update.author == bot) {
                reactionMsg = await update.edit(msg);
            }
            else {
                reactionMsg = update;
            }
        }
        if (update) {
            // Remove reactions that are no longer used.
            reactionMsg.reactions.cache.forEach(reaction => {
                // Find the emote id or name depending on if the emote is custom or not
                let parsedEmote;
                if (!reaction.emoji.id) {
                    parsedEmote = reaction.emoji.name;
                }
                else {
                    parsedEmote = reaction.emoji.id;
                }
                if (emojis.indexOf(String(parsedEmote)) < 0) {
                    reaction.remove();
                }
            });
        }
        if (create) {
            // Add reactions to the message
            for (emoteID of emojis) {
                reactionMsg.react(emoteID);
            }
            guild.messageID = String(reactionMsg.id);
            guild.channelID = String(reactionMsg.channel.id);
            socket.app.database.editReactionRoles(String(message.guild.id), guild.channelID, guild.messageID, guild.roles);
            message.delete();
        }

        async function getEmote(sock, initiator, roleList, emojis = false, add = true) {
            let emoteMsg;
            let embed = await sock.getEmbed('reactionRoles', [initiator.member])
            if (add) {
                let fieldNum = 0;
                embed.setDescription("React to this message with the emote you would like to assign the roles to.");
                if (roleList.length > 40) {
                    for (i = 1; i <= Math.ceil(roleList.length / 40); i++) {
                        if (fieldNum < 24) {
                            embed.addField("Roles", roleList.slice((i - 1) * 40, i * 40).join('\n'), true);
                            embed.setFooter("");
                            fieldNum += 1;
                        }
                        else {
                            fieldNum = 0;
                            initiator.channel.send(embed);
                            embed = sock.getEmbed('reactionRoles', [initiator.member]);
                            embed.setDescription("");
                            embed.setTitle("");
                        }
                    }
                }
                else {
                    embed.addField("Roles", roleList.join('\n'), true);
                }
                emoteMsg = await initiator.channel.send(embed);
            }
            else {
                embed.setDescription("React to this message with the emote you would like to remove from reactions.");
                printableEmojis = [];
                for (emoteID of emojis) {
                    printableEmote = Number(emoteID) ? await sock.driver.emojis.cache.get(emoteID) : emoteID;
                    printableEmojis.push(printableEmote);
                }
                embed.addField("Current Reactions", printableEmojis.join(' '));
                emoteMsg = await initiator.channel.send(embed);
                for (emoteID of emojis) {
                    emoteMsg.react(emoteID);
                }
            }
            let collect = true;
            // Wait for reactin from the original message sender
            let collected = await emoteMsg.awaitReactions((reaction, user) => user.id === initiator.author.id, { max: 1, time: 60000, errors: ['time'] })
                .catch(err => {
                    initiator.reply("Error getting emote");
                    collect = false;
                });
            if (!collect) {
                return false;
            }

            // Find the emote id or name depending on if the emote is custom or not
            let reaction = collected.first();
            let emoji = reaction.emoji;
            if (!emoji.id) {
                reaction = emoji.name;
            }
            else {
                reaction = emoji.id;
                if (!sock.driver.emojis.cache.has(reaction) || emoji.managed) {
                    reaction = false;
                }
            }

            // Recursively get emote if not available
            if (reaction) {
                emoteMsg.delete();
                return reaction;
            }
            else {
                emoteMsg.delete();
                let errorMsg = await initiator.channel.send("I do not have access to that emote at this time, please try again!");
                errorMsg.delete({ timeout: 5000 });
                return getEmote(sock, initiator, roleList, emojis, add);
            }
        }
    },
};