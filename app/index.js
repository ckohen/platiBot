'use strict';

const Application = require('./Application');

module.exports = {
  default: options => new Application(options),
  // Main Managers
  Application,
  APIManager: require('./managers/APIManager'),
  AuthManager: require('./managers/AuthManager'),
  BaseManager: require('./managers/BaseManager'),
  DatabaseManager: require('./managers/DatabaseManager'),
  DiscordManager: require('./managers/DiscordManager'),
  EventManager: require('./managers/EventManager'),
  HTTPManager: require('./managers/HTTPManager'),
  IrcManager: require('./managers/IrcManager'),
  LogManager: require('./managers/LogManager'),
  TwitchManager: require('./managers/TwitchManager'),

  // Utilities
  Util: require('./util/UtilManager'),
  Constants: require('./util/Constants'),
  DiscordUtil: require('./util/DiscordUtil'),
  HTTPUtil: require('./util/HTTPUtil'),
  TwitchUtil: require('./util/TwitchUtil'),

  // Handlers
  BaseAppCommand: require('./discord/interactions/applicationCommands/BaseAppCommand'),
  BaseCommand: require('./discord/commands/BaseCommand'),
  BaseInteraction: require('./discord/interactions/BaseInteraction'),
  BaseRequest: require('./http/requests/BaseRequest'),
  BaseTable: require('./database/tables/BaseTable'),
  TwitchCommand: require('./irc/commands/TwitchCommand'),

  // Handler Abstraction (managers)
  CommandHandler: require('./irc/handlers/command'),
  CommandManager: require('./discord/commands/CommandManager'),
  InteractionManager: require('./discord/interactions/InteractionManager'),
  RequestManager: require('./http/requests/RequestManager'),
  TableManager: require('./database/tables/TableManager'),
  TwitchCommandManager: require('./irc/commands/TwitchCommandManager'),

  // Twitch
  TwitchBase: require('./twitch/structures/TwitchBase'),
  TwitchCategory: require('./twitch/structures/TwitchCategory'),
  TwitchChannel: require('./twitch/structures/TwitchChannel'),
  TwitchFollow: require('./twitch/structures/TwitchFollow'),
  TwitchHypeTrain: require('./twitch/structures/TwitchHypeTrain'),
  TwitchRedemption: require('./twitch/structures/TwitchHypeTrain'),
  TwitchReward: require('./twitch/structures/TwitchReward'),
  TwitchStream: require('./twitch/structures/TwitchStream'),
  TwitchTag: require('./twitch/structures/TwitchTag'),
  TwitchUser: require('./twitch/structures/TwitchUser'),
};
