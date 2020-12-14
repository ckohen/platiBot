module.exports = {
    name: 'colormanager',
    description: 'Allows server admins to change self-assingable color roles',
    permissions: 'MANAGE_ROLES',
    aliases: ['cm'],
    usage: [
        '',
        '(add|remove) <@role> [@role @role etc..]',
        'remove <role(not mentioned, e.g. if deleted)>',
        'channel <#channel>',
        '[list]'
    ],

    async run(socket, message, args) {
        const commandPrefix = socket.prefixes.get(String(message.guild.id)).prefix;
        const routines = ['add', 'remove', 'channel', 'list'];

        const [methodRaw, chroleRaw, ...extraArgs] = args;
        const method = methodRaw ? methodRaw.toLowerCase() : "list";

        if (!routines.includes(method)) {
            return message.reply('Specify a valid subroutine');
        }

        let channel = null;
        let roles = [];

        //  A list of key value pairs with channels and available roles
        let guild = socket.colorManager.get(String(message.guild.id));

        // The second argument changes
        if (method == "channel") {
            // Check for actual channel
            if (chroleRaw && chroleRaw.startsWith('<#') && chroleRaw.endsWith('>')) {
                channel = message.guild.channels.cache.get(chroleRaw.slice(2, -1));
            }
            else if (chroleRaw) {
                return message.reply("Please specify a valid channel");
            }
        }
        else {
            // Check for actual role
            if (chroleRaw && chroleRaw.startsWith('<@&') && chroleRaw.endsWith('>')) {
                roles[0] = message.guild.roles.cache.get(chroleRaw.slice(3, -1));
            }
            channel = Object.keys(guild.roles)[0];
        }

        // Check for extra roles and specifying makeme or makemenot only
        if (extraArgs) {
            extraArgs.forEach(elem => {
                if (elem.startsWith('<@&') && elem.endsWith('>')) {
                    roles.push(message.guild.roles.cache.get(elem.slice(3, -1)));
                }
            });
        }

        let botHighest = message.guild.me.roles.highest;
        roles = roles.filter(role => (role.comparePositionTo(botHighest) < 0) && !role.managed);

        let roleNames = [];
        roles.forEach(role => roleNames.push(role.name.toLowerCase()));
        let roleSnowflakes = [];
        roles.forEach(role => roleSnowflakes.push(role.id));

        switch (method) {
            case 'add':
                // There must be a channel first
                if (Object.keys(guild.roles).length < 1) {
                    return message.reply("Please specify a color change channel using `" + commandPrefix + "colormanager channel <#channel>` first")
                }

                if (roleNames.length < 1) {
                    return message.reply("Please provide at least one valid role to add. *The bot must have a higher role than all roles it is assigning!*");
                }

                // Edit channel and snowflakes
                guild.roles[channel] = modifyRoles(guild.roles[channel]);
                guild.snowflakes = modifySnowflakes(guild.snowflakes);

                break;
            case 'remove':
                // There must be a channel first
                if (Object.keys(guild.roles).length < 1) {
                    return message.reply("Please specify a color change channel using `" + commandPrefix + "colormanager channel <#channel>` first")
                }

                if (roleNames.length < 1) {
                    // Check if deleting a string based role

                    if (chroleRaw) {
                        let roleString = chroleRaw;
                        if (extraArgs) {
                            roleString = chroleRaw + " " + extraArgs.join(" ");
                        }

                        let role = message.guild.roles.cache.find(roles => roles.name.toLowerCase() === roleString.toLowerCase());
                        if (role) {
                            roleNames.push(roleString);
                            roleSnowflakes.push(role.id);
                            guild.roles[channel] = modifyRoles(guild.roles[channel], false);
                            guild.snowflakes = modifySnowflakes(guild.snowflakes, false);
                        }
                        break;
                    }
                }

                guild.roles[channel] = modifyRoles(guild.roles[channel], false);
                guild.snowflakes = modifySnowflakes(guild.snowflakes, false);

                break;
            case 'channel':
                if (Object.keys(guild.roles).length < 1) {
                    guild.roles[String(channel.id)] = ["remove"];
                }
                else {
                    let oldchannel = Object.keys(guild.roles)[0];
                    let roles = [];
                    guild.roles[oldchannel].forEach(role => {
                        roles.push(role);
                    });
                    delete guild.roles[oldchannel];
                    guild.roles[String(channel.id)] = roles;
                }
                break;
            case 'list':
            default:
                ;
        }

        await socket.app.database.editColorManager(String(message.guild.id), guild.roles, guild.snowflakes);

        // Determine the number of channels and get ready to loop through them
        let channels = Object.keys(guild.roles);

        // Create base embed
        let msg = socket.getEmbed('colormanager', [message.member, commandPrefix]);
        if (channels.length < 1) {
            return message.channel.send("**No channel specified yet**", msg);
        }
        // Variables for counting to limt
        let fields = 0;
        let lines = 0;
        // Variables to store looped information
        let channelObj;
        let roleObj;
        let outRoles = [];
        // Loop through each channel found
        channels.forEach(channelID => {
            lines = 0;
            channelObj = message.guild.channels.cache.get(channelID);

            // Get role objects so discord can embed properly
            guild.snowflakes.forEach(id => {
                roleObj = message.guild.roles.cache.get(id);
                outRoles.push(roleObj);
            });

            // Create and send embeds
            if (outRoles.length > 40) {
                for (i = 1; i <= Math.ceil(outRoles.length / 40); i++) {
                    if (fields < 24) {
                        msg.addField(channelObj.name, outRoles.slice((i - 1) * 40, i * 40).join("\n"), true);
                        fields += 1;
                    }
                    else {
                        fields = 0;
                        message.channel.send(msg);
                        msg = socket.getEmbed('colormanager', [message.member, commandPrefix]);
                    }
                }
            }
            else if (outRoles.length > 0) {
                msg.addField(channelObj.name, outRoles.join('\n'), true);
                fields += 1;
            }
            // Clear arrays
            outRoles = [];
        });

        msg.addField("Remove Color", "remove", true)
        message.channel.send(msg);

        function modifyRoles(existingRoles, add = true) {
            let newRoles = [];
            // Add all existing Roles to newRole array
            existingRoles.forEach(roleName => {
                newRoles.push(roleName);
            })
            roleNames.forEach(name => {
                // Mode add
                if (existingRoles.indexOf(name) < 0 && add) {
                    newRoles.splice(newRoles.length - 1, 1);
                    newRoles.push(name);
                    newRoles.push("remove");
                }
                // Mode remove
                else if (existingRoles.indexOf(name) > -1 && !add) {
                    newRoles.splice(newRoles.indexOf(name), 1);
                }
            });
            return newRoles;
        }

        function modifySnowflakes(existingSnowflakes, add = true) {
            let newSnowflakes = [];
            // Add all existing Roles to newRole array
            existingSnowflakes.forEach(roleID => {
                newSnowflakes.push(roleID);
            })
            roleSnowflakes.forEach(id => {
                // Mode add
                if (existingSnowflakes.indexOf(id) < 0 && add) {
                    newSnowflakes.push(id);
                }
                // Mode remove
                else if (existingSnowflakes.indexOf(id) > -1 && !add) {
                    newSnowflakes.splice(newSnowflakes.indexOf(id), 1);
                }
            });
            return newSnowflakes;
        }
    },
};