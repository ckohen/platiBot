'use strict';

module.exports = {
  ban(user, moderator, reason) {
    return `**${user}** was banned by **${moderator}** ${reason}`;
  },

  banAutomatic(user) {
    return `**${user}** was banned automatically`;
  },

  delete(user, moderator) {
    return `A message from **${user}** was deleted by **${moderator}**`;
  },

  deleteAutomatic(user) {
    return `A message from **${user}** was deleted automatically`;
  },

  review(user) {
    return `A message from **${user}** may require moderation`;
  },

  timeout(user, moderator, duration, reason) {
    return `**${user}** was timed out for ${duration} by **${moderator}** ${reason}`;
  },

  timeoutAutomatic(user, duration) {
    return `**${user}** was timed out for ${duration} automatically`;
  },

  unban(user, moderator) {
    return `**${user}** was pardoned by **${moderator}**`;
  },
  
  streamUp(role, userLogin, title_url) {
    return `Hey ${role}, ${userLogin} is now live at <${title_url}>! Go check it out!`;
  },

  streamDown(userLogin) {
    return userLogin + ` has finished streaming :)`;
  },
};
