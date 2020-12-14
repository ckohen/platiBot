'use strict';

module.exports = async (socket, reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) {
        try {
            await reaction.fetch();
        }
        catch (error) {
            return socket.app.log.out('debug', module, "Could not get partial reaction: " + error)
        }
    }

    //  A list of key value pairs with channels and available roles
    let guild = socket.reactionRoles.get(String(reaction.message.guild.id));
    if (!guild) return;
    if (!guild.messageID || guild.messageID != reaction.message.id) return;

    let emojis = Object.keys(guild.roles);

    // Find the emote id or name depending on if the emote is custom or not
    let emote;
    if (!reaction.emoji.id) {
        emote = reaction.emoji.name;
    }
    else {
        emote = reaction.emoji.id;
    }

    // Check if the emote is a valid reaction role
    if (emojis.indexOf(emote) < 0) return;

    // Get the user as a guild member
    let member = await reaction.message.guild.members.fetch(user.id);

    try {
        member.roles.add(guild.roles[String(emote)]);
    }
    catch (error) {
        socket.app.log.out('info', module, "Error adding reaction roles", error);
    }
};