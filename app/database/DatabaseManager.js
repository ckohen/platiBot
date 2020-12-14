'use strict';

const mysql = require('mysql2');

/**
 * Database manager for the application.
 * @private
 */
class DatabaseManager {
  /**
   * Create a new database manager instance.
   * @param {Application} app
   * @returns {self}
  */
  constructor(app) {
    /**
     * The application container.
     * @type {Application}
     */
    this.app = app;

    /**
     * The database driver.
     * @type {Pool}
     */
    this.driver = mysql.createPool(this.app.options.database);
  }

  /**
   * Create a connection to the database.
   * @returns {Promise}
   */
  connection() {
    return new Promise((resolve, reject) => {
      this.driver.getConnection((err, connection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });
  }

  /**
   * Query the database.
   * @param {string} query
   * @param {Array} [args]
   * @returns {Promise}
   */
  async query(query, args = null) {
    const connection = await this.connection();

    return new Promise((resolve, reject) => {
      connection.execute(query, args, (err, results) => {
        connection.release();
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  /**
   * Get all settings.
   * @returns {Promise}
   */
  getSettings() {
    return this.query('SELECT name, value FROM `settings`');
  }

   /**
   * Get streaming settings.
   * @returns {Promise}
   */
  getStreaming() {
    return this.query('SELECT name, channel, role, lastMessage FROM `streaming`');
  }

   /**
   * Updates streaming last message.
   * @param {string} key
   * @param {string} messageID
   * @returns {Promise}
   */
  editStreaming(key, messageID) {
    return this.query(
      'UPDATE `streaming` SET `lastMessage` = ? WHERE `name` = ?', 
      [messageID, key],
    );
  }

   /**
   * Get New member role settings.
   * @returns {Promise}
   */
  getAddMembers() {
    return this.query('SELECT guildID, roleID, delayTime FROM `newmemberrole`');
  }

  /**
   * Add a new member role setting
   * @param {string} id
   * @returns {Promise}
   */
  addAddMembers(id) {
    return this.query(
      'INSERT INTO `newmemberrole` (guildID, roleID, delayTime) VALUES (?, \'\', \'0\')',
      [id],
    );
  }

    /**
   * Remove a new member role setting
   * @param {string} id
   * @returns {Promise}
   */
  deleteAddMembers(id) {
    return this.query(
      'DELETE FROM `newmemberrole` WHERE `guildID` = ?',
      [id],
    );
  }

   /**
   * Updates new member role setting
   * @param {string} id
   * @param {string} roleID
   * @param {string} time
   * @returns {Promise}
   */
  editAddMembers(id, roleID, delayTime) {
    return this.query(
      'UPDATE `newmemberrole` SET `roleID` = ?, `delayTime` = ? WHERE `guildID` = ?', 
      [roleID, delayTime, id],
    );
  }

  /**
   * Get rooms.
   * @returns {Promise}
   */
  getRooms() {
    return this.query('SELECT guildRoomID, data FROM `rooms`')
      .then((all) => {
        all.forEach((row) => {
          row.data = JSON.parse(row.data);
        }); 
        return all;
      });
  }

  /**
   * Add a room to the rooom manager
   * @param {string} id
   * @returns {Promise}
   */
  addRoom(id) {
    return this.query(
      'INSERT INTO `rooms` (guildRoomID, data) VALUES (?, \'{}\')',
      [id],
    );
  }

  /**
   * Remove a room from the room manager
   * @param {string} id
   * @returns {Promise}
   */
  deleteRoom(id) {
    return this.query(
      'DELETE FROM `rooms` WHERE `guildRoomID` = ?',
      [id],
    );
  }

  /**
   * Edit a room.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise}
   */
  editRoom(id, data) {
    return this.query(
      'UPDATE `rooms` SET `data` = ? WHERE `guildRoomID` = ?',
      [JSON.stringify(data), id]
    );
  }

  /**
   * Get role manager settings.
   * @returns {Promise}
   */
  getRoleManager() {
    return this.query('SELECT guildID, addRoles, removeRoles FROM `rolemanager`')
      .then((all) => {
        all.forEach((row) => {
          row.addRoles = JSON.parse(row.addRoles); 
          row.removeRoles = JSON.parse(row.removeRoles);
        }); 
        return all;
      });
  }

  /**
   * Add a guild to the rolemanager
   * @param {string} id
   * @returns {Promise}
   */
  addRoleManager(id) {
    return this.query(
      'INSERT INTO `rolemanager` (guildID, addRoles, removeRoles) VALUES (?, \'{}\', \'{}\')',
      [id],
    );
  }

  /**
   * Remove a guild from the rolemanager
   * @param {string} id
   * @returns {Promise}
   */
  deleteRoleManager(id) {
    return this.query(
      'DELETE FROM `rolemanager` WHERE `guildID` = ?',
      [id],
    );
  }

  /**
   * Edit the role manager for a guild.
   * @param {string} id
   * @param {Object} addRoles
   * @param {Object} removeRoles
   * @returns {Promise}
   */
  editRoleManager(id, addRoles, removeRoles) {
    return this.query(
      'UPDATE `rolemanager` SET `addRoles` = ?, `removeRoles` = ? WHERE `guildID` = ?',
      [JSON.stringify(addRoles), JSON.stringify(removeRoles), id]
    );
  }

  /**
 * Get color manager settings.
 * @returns {Promise}
 */
  getColorManager() {
    return this.query('SELECT guildID, roles, snowflakes FROM `colormanager`')
      .then((all) => {
        all.forEach((row) => {
          row.roles = JSON.parse(row.roles);
          row.snowflakes = JSON.parse(row.snowflakes);
        }); 
        return all;
      });
  }

  /**
   * Add a guild to the rolemanager
   * @param {string} id
   * @returns {Promise}
   */
  addColorManager(id) {
    return this.query(
      'INSERT INTO `colormanager` (guildID, roles, snowflakes) VALUES (?, \'{}\', \'[]\')',
      [id],
    );
  }

  /**
  * Remove a guild from the colormanager
  * @param {string} id
  * @returns {Promise}
  */
  deleteColorManager(id) {
    return this.query(
      'DELETE FROM `colormanager` WHERE `guildID` = ?',
      [id],
    );
  }

  /**
   * Edit the color role manager for a guild.
   * @param {string} id
   * @param {Object} roles
   * @param {Object Array} snowflakes
   * @returns {Promise}
   */
  editColorManager(id, roles, snowflakes) {
    return this.query(
      'UPDATE `colormanager` SET `roles` = ?, `snowflakes` = ? WHERE `guildID` = ?',
      [JSON.stringify(roles), JSON.stringify(snowflakes), id]
    );
  }

  /**
* Get reaction manager settings.
* @returns {Promise}
*/
  getReactionRoles() {
    return this.query('SELECT guildID, channelID, messageID, roles FROM `reactionroles`')
      .then((all) => {
        all.forEach((row) => {
          row.roles = JSON.parse(row.roles);
        }); 
        return all;
      });
  }

  /**
   * Add a guild to the reactionmanager
   * @param {string} id
   * @returns {Promise}
   */
  addReactionRoles(id) {
    return this.query(
      'INSERT INTO `reactionroles` (guildID, channelID, messageID, roles) VALUES (?, \'\', \'\', \'{}\')',
      [id],
    );
  }

  /**
  * Remove a guild from the reactionmanager
  * @param {string} id
  * @returns {Promise}
  */
  deleteReactionRoles(id) {
    return this.query(
      'DELETE FROM `reactionroles` WHERE `guildID` = ?',
      [id],
    );
  }

  /**
   * Edit the reaction role manager for a guild.
   * @param {string} id
   * @param {string} channelID
   * @param {string} messageID
   * @param {Object} roles
   * @returns {Promise}
   */
  editReactionRoles(id, channelID, messageID, roles) {
    return this.query(
      'UPDATE `reactionroles` SET `channelID` = ?, `messageID` = ?, `roles` = ? WHERE `guildID` = ?',
      [channelID, messageID, JSON.stringify(roles), id]
    );
  }

    /**
* Get reaction manager settings.
* @returns {Promise}
*/
getVoiceRoles() {
  return this.query('SELECT guildID, data FROM `voiceroles`')
    .then((all) => {
      all.forEach((row) => {
        row.data = JSON.parse(row.data);
      }); 
      return all;
    });
}

/**
 * Add a guild to the reactionmanager
 * @param {string} id
 * @returns {Promise}
 */
addVoiceRoles(id) {
  return this.query(
    'INSERT INTO `voiceroles` (guildID, data) VALUES (?, \'{}\')',
    [id],
  );
}

/**
* Remove a guild from the voice role manager
* @param {string} id
* @returns {Promise}
*/
deleteVoiceRoles(id) {
  return this.query(
    'DELETE FROM `voiceroles` WHERE `guildID` = ?',
    [id],
  );
}

/**
 * Edit the voice role manager for a guild.
 * @param {string} id
 * @param {Object} data
 * @returns {Promise}
 */
editVoiceRoles(id, data) {
  return this.query(
    'UPDATE `voiceroles` SET `data` = ? WHERE `guildID` = ?',
    [JSON.stringify(data), id]
  );
}

  /**
   * Get prefixes.
   * @returns {Promise}
   */
  getPrefixes() {
    return this.query('SELECT guildID, prefix FROM `prefixes`');
  }

  /**
   * Add a guild to prefixes
   * @param {string} id
   * @returns {Promise}
   */
  addPrefix(id) {
    return this.query(
      'INSERT INTO `prefixes` (guildID, prefix) VALUES (?, \'!\')',
      [id],
    );
  }

  /**
  * Remove a guild from prefixes
  * @param {string} id
  * @returns {Promise}
  */
  deletePrefix(id) {
    return this.query(
      'DELETE FROM `prefixes` WHERE `guildID` = ?',
      [id],
    );
  }

  /**
   * Edit the prefix for a guild
   * @param {string} id
   * @param {string} prefix
   * @returns {Promise}
   */
  editPrefix(id, prefix) {
    return this.query(
      'UPDATE `prefixes` SET `prefix` = ? WHERE `guildID` = ?',
      [prefix, id]
    );
  }

  /**
   * Get random channel data.
   * @returns {Promise}
   */
  getRandom() {
    return this.query('SELECT guildID, toChannel, fromChannel FROM `randomchannels`');
  }

  /**
   * Add a guild to random channels
   * @param {string} id
   * @returns {Promise}
   */
  addRandom(id) {
    return this.query(
      'INSERT INTO `randomchannels` (guildID, toChannel, fromChannel) VALUES (?, \'\', \'\')',
      [id],
    );
  }

  /**
  * Remove a guild from random channels
  * @param {string} id
  * @returns {Promise}
  */
  deleteRandom(id) {
    return this.query(
      'DELETE FROM `randomchannels` WHERE `guildID` = ?',
      [id],
    );
  }

  /**
   * Edit the random channels for a guild
   * @param {string} id
   * @param {string} toChannel
   * @param {string} fromChannel
   * @returns {Promise}
   */
  editRandom(id, toChannel, fromChannel) {
    return this.query(
      'UPDATE `randomchannels` SET `toChannel` = ?, `fromChannel` = ? WHERE `guildID` = ?',
      [toChannel, fromChannel, id]
    );
  }

  /**
   * Get volume data.
   * @returns {Promise}
   */
  getVolume() {
    return this.query('SELECT guildID, volume FROM `volumes`');
  }

  /**
 * Add a guild to volumes
 * @param {string} id
 * @returns {Promise}
 */
  addVolume(id) {
    return this.query(
      'INSERT INTO `volumes` (guildID, volume) VALUES (?, \'1\')',
      [id],
    );
  }

  /**
  * Remove a guild from volumes
  * @param {string} id
  * @returns {Promise}
  */
  deleteVolume(id) {
    return this.query(
      'DELETE FROM `volumes` WHERE `guildID` = ?',
      [id],
    );
  }

  /**
   * Edit the volume for a guild
   * @param {string} id
   * @param {string} volume
   * @returns {Promise}
   */
  editVolume(id, volume) {
    return this.query(
      'UPDATE `volumes` SET `volume` = ? WHERE `guildID` = ?',
      [volume, id]
    );
  }

  /**
   * Get all IRC moderation filters.
   * @returns {Promise}
   */
  getIrcFilters() {
    return this.query(
      'SELECT id, type, input, duration, output FROM `filters` WHERE `deleted_at` IS NULL ORDER BY `type` ASC',
    );
  }

  /**
   * Get all IRC commands.
   * @returns {Promise}
   */
  getIrcCommands() {
    return this.query(
      'SELECT id, LOWER(input) as input, method, output, locked, prefix, count, restriction as level FROM `commands` WHERE `deleted_at` IS NULL',
    );
  }

  /**
   * Count an IRC command.
   * @param {number} id
   * @returns {Promise}
   */
  countIrcCommand(id) {
    return this.query(
      'UPDATE `commands` SET `count` = count + 1 WHERE `id` = ?',
      [id],
    );
  }

  /**
   * Add an IRC command.
   * @param {string} input
   * @param {string} output
   * @param {Boolean} prefix
   * @returns {Promise}
   */
  addIrcCommand(input, output, prefix) {
    return this.query(
      'INSERT INTO `commands` (input, method, output, locked, prefix, count, created_at, updated_at) VALUES (?, NULL, ?, 0, ?, 0, NOW(), NOW())',
      [input, output, prefix],
    );
  }

  /**
   * Edit an IRC command.
   * @param {number} id
   * @param {string} output
   * @returns {Promise}
   */
  editIrcCommand(id, output) {
    return this.query(
      'UPDATE `commands` SET `output` = ?, `updated_at` = NOW() WHERE `id` = ?',
      [output, id],
    );
  }

  /**
   * Edit an IRC command restriction requirenment.
   * @param {number} id
   * @param {string} restriction
   * @returns {Promise}
   */
  editIrcRestriction(id, restriction) {
    return this.query(
      'UPDATE `commands` SET `restriction` = ?, `updated_at` = NOW() WHERE `id` = ?',
      [restriction, id],
    );
  }

  /**
   * Add an IRC command.
   * @param {number} id
   * @param {number} count
   * @returns {Promise}
   */
  addFallWin(id, count) {
    return this.query(
      'INSERT INTO `fallwins` (id, count) VALUES (?, ?)',
      [id, count],
    );
  }

  /**
   * Edit Fall Guys Wins
   * @param {number} id
   * @param {string} wins
   * @returns {Promise}
   */
  editFallWins(id, wins) {
    return this.query(
      'UPDATE `fallwins` SET `count` = ? WHERE `id` = ?',
      [wins, id],
    );
  }

  /**
 * Get all Fall Guys Win data
 * @returns {Promise}
 */
  getFallWins() {
    return this.query(
      'SELECT id, count FROM `fallwins`',
    );
  }


  /**
     * add a setting.
     * @param {string} name
     * @param {string} value
     * @returns {Promise}
     */
  addSetting(name, value) {
    return this.query(
      'INSERT INTO `settings` (name, value) VALUES (?, ?)',
      [name, value],
    );
  }

  /**
   * Edit a setting.
   * @param {string} name
   * @param {string} value
   * @returns {Promise}
   */
  editSetting(name, value) {
    return this.query(
      'UPDATE `settings` SET `value` = ? WHERE `name` = ?',
      [value, name],
    );
  }

  /**
   * Rename an IRC command.
   * @param {number} id
   * @param {string} input
   * @returns {Promise}
   */
  renameIrcCommand(id, input) {
    return this.query(
      'UPDATE `commands` SET `input` = ?, `updated_at` = NOW() WHERE `id` = ?',
      [input, id],
    );
  }

  /**
   * Delete an IRC command.
   * @param {number} id
   * @returns {Promise}
   */
  deleteIrcCommand(id) {
    return this.query(
      'UPDATE `commands` SET `deleted_at` = NOW() WHERE `id` = ?',
      [id],
    );
  }

  /**
   * Get all jokes.
   * @returns {Promise}
   */
  getJokes() {
    return this.query(
      'SELECT id, output FROM `jokes` WHERE `deleted_at` IS NULL ORDER BY RAND()',
    );
  }

  /**
   * Add a bot-initiated log entry.
   * @param {...*} values
   */
  addBotLog(...values) {
    this.query(
      'INSERT INTO `log_bot` (filter_id, action, user, user_id, duration, message, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      values,
    ).catch((err) => this.app.log.out('warn', module, err));
  }

  /**
   * Add a human-initiated log entry.
   * @param {...*} values
   */
  addHumanLog(...values) {
    this.query(
      'INSERT INTO `log_human` (action, user, user_id, moderator, moderator_id, duration, reason, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      values,
    ).catch((err) => this.app.log.out('warn', module, err));
  }
}

module.exports = DatabaseManager;
