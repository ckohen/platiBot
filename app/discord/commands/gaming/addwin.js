const { collect } = require('../../../util/helpers');
const { Collection } = require('discord.js');
const plural = require('pluralize');

module.exports = {
    guild: 'platicorn',
    name: 'addwin',
    description: 'addwin [specific user]',
    usage: [
        '[target user]'
    ],
    async run(socket, message, args) {
        args = args.join(' ');

        const commandPrefix = socket.prefixes.get(String(message.guild.id)).prefix;
        // Role manager
        async function updateEmbed(target) {

            let users = new Collection();

            await socket.app.database.getFallWins().then((all) => {
                users.clear();
                collect(users, all, "id", false);
            });

            userIds = users.keyArray();
            
            if (userIds.includes(String(target.id))) {
                let count = users.get(target.id).count;
                count = count + 1;
                users.get(target.id).count = count;
                await socket.app.database.editFallWins(target.id, count)
            }
            else {
                let count = 1;
                users.set(target.id, {});
                users.get(target.id).count = count;
                await socket.app.database.addFallWin(target.id, count)
            }

            let lines = users
                .map((item, name) => `<@!${name}>: ${plural('win', item.count, true)}!`)
                .filter((line) => line);


            let msg = socket.getEmbed("fallWins", [commandPrefix, message.author.tag || false]);
            await message.guild.channels.cache.get('746158018416214156').bulkDelete(100);
            if (lines.length > 500) {
                for (j = 1; j <= Math.ceil(lines.length / 500); j++) {
                    let sublines = lines.slice((j - 1) * 500, j * 500);
                    for (i = 1; i <= Math.ceil(sublines.length / 20); i++) {
                        msg.addField("User List", sublines.slice((i - 1) * 20, i * 20).join("\n"));
                    }
                    await message.guild.channels.cache.get('746158018416214156').send(msg);
                    let msg = socket.getEmbed("fallWins", [commandPrefix, message.author.tag || false]);
                }
            }
            else if (lines.length > 20) {
                for (i = 1; i <= Math.ceil(lines.length / 20); i++) {
                    msg.addField("User List", lines.slice((i - 1) * 20, i * 20).join("\n"));
                }
            }
            else {
                msg.addField("User List", lines.join("\n"));
            }
            
            await message.guild.channels.cache.get('746158018416214156').send(msg)

            let confmsg = await message.channel.send(`Win was added for user ${target.displayName}`);
            if (message.channel.name !== "fall-guys-tracker") {
                message.delete();
            }
            // deletes command and response messages after 3 seconds
            confmsg.delete({timeout: 3000});
        }

        let member;
        if (args) {
            try {
                member = message.guild.members.cache.find(members => members.user.username.toLowerCase() === args.toLowerCase());
            }
            catch {
                member = false;
            }
        }
        else {
            member = message.member;
        }

        if (member) {
            updateEmbed(member);
        }
        else {
            let confmsg = await message.reply("Please specify a user using their actual discord name (not their nickname)");
            message.delete();
            confmsg.delete({timeout: 3000});
        }

    },
};