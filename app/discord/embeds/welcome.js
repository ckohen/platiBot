'use strict';

module.exports = (comp) => comp
  .setColor('orange')
  .setTitle('Thank You for Adding Corncierge!')
  .setDescription("This bot has a few different sets of features, here's a brief explanation of each of them.")
  .addField("Getting Started", "The best way to get started is by using `!help`", true)
  .addField("Command Prefixes", "You are able to change the prefix for all commands by using `!prefix <new prefix>`. Note that the prefix cannot have a # or @ symbol.", true)
  .addField('\u200b','\u200b')
  .addField("Role Management", "The role and color managers have many options, to get started, use `!help rolemanager` and `!help colormanager`", true)
  .addField("Moderation Commands", "There are a few moderation commands, most of them being for users in voice chat. Use `!help moderation` to see all these commands.", true)
  .addField("Rooms", "This bot supports rooms (up to 25 per server!) in order to help organize members of your server when playing games, creating meetings, etc... The rooms support a variety of features, use `!help room` to see details on how to use them.")
  .addField("Feature Requests", "This bot is actively being developed and intends to be a fully featured bot. If you have any ideas for more features or if you feel like a basic feature is missing, feel free to join the bots discord: <https://discord.gg/vNEXNYt>!")
  .addField("Music", "At this time, due to a lack of network bandwidth, music commands are not available. In the future, early adopters will get free access to the music commands.")
  .addField("Donations", "If you like this bot and want to help make it more robust, donations would be greatly appreciated. You can donate here: <https://www.paypal.me/corncierge>. Donators will get priority feature requests **and** can request highly specialized commands such as win trackers, etc...");