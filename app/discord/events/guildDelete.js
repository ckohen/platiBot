'use strict';

module.exports = (socket, guild) => {
    socket.app.log.out('info', module, "Left server: " + guild.name)
    
    // Remove guild from role and color managers
    socket.app.database.deleteColorManager(String(guild.id));
    socket.app.database.deleteRoleManager(String(guild.id));
    socket.app.database.deleteReactionRoles(String(guild.id));
    socket.app.database.deleteVoiceRoles(String(guild.id));
    socket.app.database.deletePrefix(String(guild.id));
    socket.app.database.deleteRandom(String(guild.id));
    socket.app.database.deleteAddMembers(String(guild.id));
    socket.app.database.deleteVolume(String(guild.id));
};