module.exports = {
	name: 'iamnot',
	description: 'iamnot [The role you would like to remove]',
    args: true,
    usage: '<role>',
	execute(message, args) {
        // "{<channelName1>":["<validRole1>", "<validRole2>", etc...] <channelName2>:["validRole1", "validRole2", etc...]}
        let channelName = {"role-assign": ["stream", "vod"], "mod-chat": ["mod"]};

        // if a role from a valid channel is typed in that channel remove the role from the user
        if (channelName[message.channel.name]) {
            roleAssign(channelName[message.channel.name]);
        }
        else {
            message.delete(); // delete the message
        }

        // Role manager
        function roleAssign(validRoles) {
            
            let roleName = args[0].toLowerCase(); // Convert role request to lower case for comparison
            let member = message.member; // Set user to command sender

            // If roleName is a valid role within the channel
            if (validRoles.indexOf(roleName) > -1) {

                let role = message.guild.roles.cache.find(roles => roles.name.toLowerCase() === roleName.toLowerCase()); // Find the role within the discord server
                member.roles.remove(role); // Remove the role requested

                // Notify user of role removal
                roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
                message.channel.send(`You no longer have the role ${roleName}, ${member}`);
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