'use strict';

module.exports = {
    channel: 'console',
    aliases: ['setactivity', 'activity', 'setgame'],
    usage: [
        '(add|edit) <type: PLAYING, LISTENING, WATCHING, STREAMING> <activity>',
        'remove',
    ],

    async run(socket, message, args) {
        const routines = ['add', 'edit', 'remove',];
        const types = ['PLAYING', 'LISTENING', 'WATCHING', 'STREAMING',];

        const [actionRaw, typeRaw, ...statusRaw] = args;
        const action = actionRaw ? actionRaw.toLowerCase() : null;
        let type = typeRaw ? typeRaw.toUpperCase() : null;
        const status = statusRaw ? statusRaw.length > 0
            ? statusRaw.join(' ').trim() : null : null;


        const send = (content, mention = false) => {
            if (!content) return;
            const target = mention ? `, ${message.author}` : '';
            message.channel.send(`${content}${target}.`).catch((err) => {
                socket.app.log.out('error', module, err);
            });
        };

        const respond = (content) => send(content, true);

        if (!routines.includes(action)) return respond('Specify a valid subroutine');
        if (action != "remove") {
            if (!types.includes(type)) return respond('Specify a valid status type');
        }

        let data = null;
        let method = 'editSetting';
        let failure = null;
        let success = null;


        switch (action) {
            case 'add':
            case 'edit':
                // Change status
                data = [status, type];

                // Discord automatically adds "to" to the listening status type
                if (type === "LISTENING") {
                    type = "LISTENING TO";
                }
                
                success = `Changed status to \`${type.charAt(0)}${type.substring(1).toLowerCase()} ${status}\``;
                failure = 'Couldn\'t change status';
                break;

            case 'remove':
                // Set status to null
                data = ["", ""];
                success = `Removed status`;
                failure = 'Couldn\'t change status';
                break;

            default:
                return;
        }

        try {
            await socket.driver.user.setActivity(data[0] || null, { type: data[1] || null });
            await socket.app.database[method]("discord_activity", data[0]);
            await socket.app.database[method]("discord_activity_type", data[1]);
        } catch (err) {
            socket.app.log.out('error', module, err);
            return respond(failure);
        }

        return send(success);
    },
};
