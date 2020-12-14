module.exports = {
    name: 'voiceroles',
    description: 'Allows server admins to set voice roles linked to voice channels',
    permissions: 'MANAGE_ROLES',
    aliases: ['voice', 'vr'],
    usage: [
        'add <@role> <#channel> [#channel #channel ...]',
        'add <@role> <channel name>',
        'remove (@role|#channel|channel name)',
        '[list]'
    ],

    async run(socket, message, args) {
        const commandPrefix = socket.prefixes.get(String(message.guild.id)).prefix;
        const routines = ['add', 'remove', 'list'];

        const [methodRaw, chRoleRaw, ...extraArgs] = args;
        const method = methodRaw ? methodRaw.toLowerCase() : "list";

        if (!routines.includes(method)) {
            return message.reply('Specify a valid subroutine');
        }

        let role = null;
        let roleObj;
        let channels = [];

        //  A list of key value pairs with channels and available roles
        let guild = socket.voiceRoles.get(String(message.guild.id));


        // Check if channel or role and if it's valid
        if (chRoleRaw && chRoleRaw.startsWith('<#') && chRoleRaw.endsWith('>')) {
            channels[0] = chRoleRaw.slice(2, -1);
        }
        else if (chRoleRaw && chRoleRaw.startsWith('<@&') && chRoleRaw.endsWith('>')) {
            role = chRoleRaw.slice(3, -1);
            roleObj = message.guild.roles.cache.get(role);
        }
        
        let channelObj;
        // Check for extra channels
        if (extraArgs) {
            extraArgs.forEach(elem => {
                if (elem.startsWith('<#') && elem.endsWith('>')) {
                    // Check if the current channel is a voice channel
                    channelObj = message.guild.channels.cache.get(elem.slice(2, -1));
                    if (channelObj && channelObj.type === 'voice') {
                        channels.push(elem.slice(2, -1));
                    }
                }
            });
        }

        // Limit roles to be below bots highest role
        let botHighest = message.guild.me.roles.highest;
        if (method == "add" && (!roleObj || roleObj.comparePositionTo(botHighest) > -1 || roleObj.managed)) {
            return message.reply("Please provide a valid role to add. *The bot must have a higher role than the roles it is assigning!*");
        }

        // If there are no channels, try using a channel name instead
        if (channels.length < 1) {
            let namedChannel = extraArgs.join(' ');
            if (method != "add") {
                namedChannel = `${chRoleRaw} ${namedChannel}`;
            }
            namedChannel = await message.guild.channels.cache.find(channel => channel.name.toLowerCase().trim() === namedChannel.toLowerCase().trim() && channel.type === "voice");
            if (namedChannel) {
                channels[0] = namedChannel.id;
            }
        }

        // Store the existing emojis
        let roles = Object.keys(guild.data);
        let channel;

        switch (method) {
            case 'add':
                // Only allow 5 different voice roles
                if (roles.length > 4 && roles.indexOf(role) < 0) {
                    return message.reply("There are already 5 sets of voice roles in this server, plese remove one first.")
                }

                // Catch if no channels are being added
                if (channels.length < 1) {
                    return message.reply("Please specify at least one channel where the role should be assigned.");
                }

                // Check if the channel already exists in one of the role associations
                let duplicate = false;
                let move = false;
                for (channelID of channels) {
                    // Loop through the role list to check for duplicates
                    roles.forEach(roleID => {
                        if (guild.data[roleID].indexOf(channelID) > -1) {
                            duplicate = true;
                        }
                    });
                    // If it's a duplicate, confirm with the user what they want to do
                    if (duplicate) {
                        channel = message.guild.channels.cache.get(channelID);
                        confirmMsg = await message.channel.send(`The channel ${channel} already has a role associated with it. Would you like to change to the new role? ✅ (yes) or ❌(no)`);
                        await confirmMsg.react('✅');
                        await confirmMsg.react('❌');
                        let reacted = true;
                        let collected = await confirmMsg.awaitReactions((reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, { max: 1, time: 60000, errors: ['time'] })
                            .catch(err => {
                                message.reply("Not a valid reaction, cancelling!");
                                confirmMsg.delete().then(confMsg => reacted = false);
                            });
                        if (!reacted) {
                            return;
                        }

                        // Find the emote id or name depending on if the emote is custom or not
                        reaction = collected.first();
                        if (reaction.emoji.name === '❌') {
                            confirmMsg.delete();
                        }
                        else {
                            confirmMsg.delete();
                            move = true;
                        }
                        if (move) {
                            roles.forEach(roleID => {
                                if (guild.data[roleID].indexOf(channelID) > -1) {
                                    guild.data[roleID].splice(guild.data[roleID].indexOf(channelID), 1);
                                    if (guild.data[roleID].length < 1) {
                                        delete guild.data[roleID];
                                    }
                                }
                            });
                        }
                        else {
                            channels.splice(channels.indexOf(channelID), 1);
                        }
                    }
                    move = false;
                    duplicate = false;
                }

                // Put the channels in the guild array
                if (roles.indexOf(role) > -1) {
                    guild.data[role] = guild.data[role].concat(channels);
                }
                else {
                    guild.data[role] = channels;
                }
                break;
            case 'remove':
                // Handle deleting roles and channels differently
                if (role) {
                    if (roles.indexOf(role) > -1) {
                        delete guild.data[role];
                        message.channel.send(`That voice role will no longer be assigned for all associated channels.`);
                    }
                    else {
                        return message.reply("That role is not currently associated with any voice channels!");
                    }
                }
                else if (channels[0]) {
                    // Search for the role that the channel is associated with
                    let removed = false;
                    let roleRemoved = false;
                    roles.forEach(roleID => {
                        if (guild.data[roleID].indexOf(channels[0]) > -1) {
                            guild.data[roleID].splice(guild.data[roleID].indexOf(channels[0]), 1);
                            if (guild.data[roleID].length < 1) {
                                delete guild.data[roleID];
                                roleRemoved = true;
                            }
                            removed = true;
                        };
                    });
                    // Confirm the result
                    if (removed) {
                        message.channel.send(`That channel no longer has a voice role associated with it.` + (roleRemoved ? ` The associated role has no more channels assigned, it has also been removed` : ""));
                    }
                    else {
                        return message.reply("That channel is not currently associated with a voice role.");
                    }
                }
                break;
            case 'list':
            default:
                ;
        }

        await socket.app.database.editVoiceRoles(String(message.guild.id), guild.data);

        // Create base embed
        let msg = socket.getEmbed('voiceRoles', [message.member, commandPrefix]);
        if (roles.length < 1) {
            return message.channel.send("**No voice roles specified yet**, a role named `voice` will apply to all voice channels until at least one is specified.", msg);
        }
        // Variables to store looped information
        roles = Object.keys(guild.data);
        let outChannels = [];
        // Loop through each emoji found
        for (roleID of roles) {
            roleObj = message.guild.roles.cache.get(roleID);

            // Put channels in discord mention form so discord will resolve names
            guild.data[roleID].forEach(channelID => {
                outChannels.push(`<#${channelID}>`);
            });

            // Create actual data in embed
            if (outChannels.length > 30) {
                for (i = 1; i <= Math.ceil(outChannels.length / 30); i++) {
                    msg.addField(roleObj ? roleObj.name : `Deleted role, id: ${roleID}`, outChannels.slice((i - 1) * 30, i * 30).join('\n'), true);
                }
            }
            else if (outChannels.length > 0) {
                msg.addField(roleObj ? roleObj.name : `Deleted role, id: ${roleID}`, outChannels.join('\n'), true);
            }
            // Clear arrays
            outChannels = [];
        }
        message.channel.send(msg);
    },
};