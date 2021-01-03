'use strict';

const moment = require('moment');

const helpers = require.main.require('./app/util/helpers');

const lang = require('../lang');
const twitch = require('../util');

module.exports = (socket, callback, hasArgs, user, target) => {
  const followCall = (userId, handle) => {
    socket.app.api
      .follow(userId)
      .then(body => {
        if (body.created_at === null) return false;

        const age = moment(body.created_at).valueOf();

        return callback(lang.followage(handle, helpers.humanDate(age), helpers.relativeTime(age)));
      })
      .catch(err => {
        if (err.statusCode === 404 || err.statusCode === '404') {
          return callback();
        }

        socket.app.log.error(module, err);
        return false;
      });
  };

  if (hasArgs) {
    socket.app.api.user(target, body => {
      if (body.users.length === 0) return false;

      const obj = body.users[0];
      const name = obj.display_name || obj.name;

      // eslint-disable-next-line no-underscore-dangle
      return followCall(obj._id, name);
    });

    return false;
  }

  return followCall(user['user-id'], twitch.handle(user));
};