const { collect, usage } = require('../../util/helpers');
const { Collection } = require('discord.js');
const plural = require('pluralize');

module.exports = {
    name: 'setwins',
    description: 'setwins [number] [specific user]',
    usage: [
        '<number>',
        '<number> <target user>'
    ],
    async run(socket, message, args) {

        const [newCountRaw, ...userRaw] = args;
        const newCount = newCountRaw ? Number(newCountRaw) : -1;
        const user = userRaw.length > 0 ? userRaw.join(' ') : null;

        // Role manager
        async function updateEmbed(target, updatedCount) {

            let users = new Collection();

            await socket.app.database.getFallWins().then((all) => {
                users.clear();
                collect(users, all, "id", false);
            });

            userIds = users.keyArray();

            if (userIds.includes(String(target.id))) {
                users.get(target.id).count = updatedCount;
                await socket.app.database.editFallWins(target.id, updatedCount)
            }
            else {
                users.set(target.id, {});
                users.get(target.id).count = updatedCount;
                await socket.app.database.addFallWin(target.id, updatedCount)
            }

            let lines = users
                .map((item, name) => `${message.guild.members.get(name)}: ${plural('win', item.count, true)}!`)
                .filter((line) => line);


            let msg = socket.getEmbed("fallWins", [])
            if (lines.length > 200) {
                for (j = 1; j <= Math.ceil(lines.length / 200); j++) {
                    let sublines = lines.slice((j - 1) * 200, j * 200);
                    for (i = 1; i <= Math.ceil(sublines.length / 20); i++) {
                        msg.addField("User List", sublines.slice((i - 1) * 20, i * 20).join("\n"));
                    }
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

            await message.guild.channels.get('746158018416214156').bulkDelete(100);
            await message.guild.channels.get('746158018416214156').send(msg)

            let confmsg = await message.channel.send(`Win count was set to ${updatedCount} for user ${target.displayName}`);
            if (message.channel.name !== "fall-guys-tracker") {
                message.delete();
            }
            // deletes command and response messages after 3 seconds
            setTimeout(function () { confmsg.delete(); }, 3000);
        }

        let validNumber
        if (newCount >= 0) {
            validNumber = true;
        }
        else {
            validNumber = false;
        }

        let member;
        if (user) {
            try {
                member = message.guild.members.find(members => members.user.username.toLowerCase() === user.toLowerCase());
            }
            catch {
                member = false;
            }
        }
        else {
            member = message.member;
        }

        if (validNumber) {
            if (member) {
                updateEmbed(member, newCount);
            }
            else {
                let confmsg = await message.reply("Please specify a user using their actual discord name (not their nickname)");
                message.delete();
                setTimeout(function () { confmsg.delete(); }, 3000);
            }
        }
        else {
            let confmsg = await message.reply("Please specify a win count (>0)!");
                message.delete();
                setTimeout(function () { confmsg.delete(); }, 3000);
        }

    },
};