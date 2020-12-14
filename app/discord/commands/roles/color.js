module.exports = {
    name: 'color',
    description: 'color [The color from the predefined list of colors]',
    args: true,
    usage: '<color-role-name>',
    async run(socket, message, args) {
        args = args.join(' ');

        // Get the current guild from the colorManager
        let guild = socket.colorManager.get(String(message.guild.id));
        // A list of key value pairs with channels and available roles
        let channelName = guild.roles;

        // An array of snowflakes for all the available color roles to remove all color roles before assigning a new one
        let colorSnowflakes = guild.snowflakes;
        
        // If a role from a valid channel is typed in that channel add the role to the user
        if (channelName[String(message.channel.id)]) {
            roleAssign(channelName[String(message.channel.id)]);
        }
        else {
            message.delete(); // Delete the message
        }

        // Role manager
        async function roleAssign(validRoles) {

            let roleName = args.toLowerCase(); // Convert role request to lower case for comparison
            let member = message.member; // Set user to command sender 

            // If roleName is a valid role within the channel
            let rollAssigned = false;

            if (validRoles.indexOf(roleName) > -1) {
                await member.roles.remove(colorSnowflakes); // Remove all predefined colors *Does not remove specialty colors*
                if (roleName === "remove") {
                    message.channel.send(`Your color has been removed, ${member}`)

                    socket.app.log.out('info', module, 'Removed ' + member.user.username + "'s color");
                }
                else {
                    let role = message.guild.roles.cache.find(roles => roles.name.toLowerCase() === roleName.toLowerCase()); // Find the role within the discord server
                    await member.roles.add(role); // Add the role requested

                    socket.app.log.out('info', module, 'Changed ' + member.user.username + "'s color to " + role.name);

                    // Notify user of role addition
                    roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
                    message.channel.send(`Your color has been changed to ${roleName}, ${member}`);
                }
                rollAssigned = true;
            }

            else { // If the role is invalid in the channel, notify user 

                roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
                message.channel.send(`${roleName} isn't a valid color, ${member}`);
                rollAssigned = false;
            }

            // deletes command and resopne messages after 3 seconds
            setTimeout(function () { message.channel.bulkDelete(2); }, 3000);

            return rollAssigned;
        }

    },
};