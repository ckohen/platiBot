'use strict';

module.exports = (socket, before, after) => {
  if (after.channelID == before.channelID) return;

  let afterRole = after.guild.roles.cache.find((item) => item.name.toLowerCase() === 'voice');
  let beforeRole = afterRole;
  let roleData = socket.voiceRoles.get(String(after.member.guild.id));

  if (Object.keys(roleData.data).length > 0) {
    afterRole = null;
    let afterID = null;
    let beforeID = null;
    let roles = Object.keys(roleData.data);
    roles.forEach(roleID => {
      if (roleData.data[roleID].indexOf(after.channelID) > -1) {
        afterID = roleID;
      }
      if (roleData.data[roleID].indexOf(before.channelID) > -1) {
        beforeID = roleID;
      }
    });
    if (afterID != beforeID) {
      if (afterID) {
        afterRole = after.guild.roles.cache.get(afterID);
      }
      if (beforeID) {
        beforeRole = after.guild.roles.cache.get(beforeID);
      }
    }
  }

  let musicData = socket.musicData.get(String(after.guild.id));

  if (after.channelID !== null) {
    if (after.member.user.id == socket.driver.user.id && !after.selfDeaf) {
      after.setSelfDeaf(true);
      return;
    }
    if (after.member.user.bot && !after.deaf) {
      after.setDeaf(true);
      return;
    }
    if (afterRole) {
      after.member.roles.add(afterRole).catch((err) => {
        socket.app.log.out('error', module, err);
      });
    }
    if (beforeRole && beforeRole != afterRole) {
      after.member.roles.remove(beforeRole).catch((err) => {
        socket.app.log.out('error', module, err);
      });
    }
    return;
  }

  if (after.member.user.bot &&
    musicData.songDispatcher &&
    after.member.user.id == socket.driver.user.id) {
    musicData.queue.length = 0;
    musicData.songDispatcher.end();
    return;
  }

  if (!beforeRole) return;
  after.member.roles.remove(beforeRole).catch((err) => {
    socket.app.log.out('error', module, err);
  });
};
