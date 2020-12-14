module.exports = {
	name: 'makemenot',
	description: 'makemenot [The role you would like to remove]',
    args: true,
    usage: '<role>',
	async run(socket, message, args) {
        args = args.join(' ');
        //  A list of key value pairs with channels and available roles
        let channelName = socket.roleManager.get(String(message.guild.id)).removeRoles;

        // if a role from a valid channel is typed in that channel remove the role from the user
        if (channelName[String(message.channel.id)]) {
            roleAssign(channelName[String(message.channel.id)]);
        }
        else {
            message.delete(); // delete the message
        }

        // Role manager
        function roleAssign(validRoles) {
            
            let roleName = args.toLowerCase(); // Convert role request to lower case for comparison
            let member = message.member; // Set user to command sender

            let roleAssigned = false;

            // If roleName is a valid role within the channel
            if (validRoles.indexOf(roleName) > -1) {

                let role = message.guild.roles.cache.find(roles => roles.name.toLowerCase() === roleName.toLowerCase()); // Find the role within the discord server
                try {
                    member.roles.remove(role); // Remove the role requested
                    roleAssigned = true;
                }
                catch (err) {
                    socket.app.log.out('error', module, err);
                    rollAssigned = false;
                }

                socket.app.log.out('info', module, 'Removed ' + role.name + " from " + member.user.username);

                // Notify user of role removal
                roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
                if (roleAssigned) {
                    message.channel.send(`You no longer have the role ${roleName}, ${member}`);
                }
                else {
                    message.channel.send(`There was an error adding the role ${roleName}, ${member}`)
                }
            }
            else { // If the role is invalid in the channel, notify user
                
                roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
                message.channel.send(`${roleName} isn't a valid role, ${member}`);
            }
            
            // Delete command and response messages after 3 seconds
            setTimeout(function() {message.channel.bulkDelete(2);}, 3000);
        }
            
    },
};