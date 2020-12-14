'use strict';

module.exports = {
    name: 'prefix',
    description: 'Allows server admins to change the prefix for all commands',
    args: true,
    permissions: 'MANAGE_GUILD',

    async run(socket, message, args) {
        args = args.join(' ');

        if (args.indexOf("@") > -1 || args.indexOf("#") > -1) {
            return message.reply("Please do not use discord mentionable charachters in your prefix (@ and #)");
        }

        try {
            socket.prefixes.get(String(message.guild.id)).prefix = args;
            await socket.app.database.editPrefix(String(message.guild.id), args);
        } catch (err) {
            socket.app.log.out('error', module, err);
            return message.reply("There was an error changing the prefix!")
        }

        return message.channel.send("Prefix has been changed to `" + args + "`");
    },
};
