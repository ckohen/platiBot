module.exports = {
    description: 'Randomly generates a number based on the argument given',
    aliases: ['rand', 'roll', 'flip'],
    usage: [
        '<number (> 0)>',
    ],

    async run(socket, message, args) {
        // Detect "flip" without args
        const commandPrefix = socket.prefixes.get(String(message.guild.id)).prefix;
        const full = message.content.slice(commandPrefix.length).trim().split(/\s+/g);
        const command = full.shift().toLowerCase();

        // The scale is specified as the first argument
        let scale = Number(args[0]);
        if (command == "flip" && !scale) {
            // Scale is 2 for a coin flip
            scale = 2;
        }
        // If there is no scale, command cannot execute
        else if (!scale) {
            return message.reply("Please specify a maximum range as a number");
        }
        // Generate random number and scale to desired output
        let rand = Math.random();
        let output = Math.ceil(rand * scale);

        // Generate random number to delay the second output (max 2 seconds)
        let delayRand = Math.random();
        let delay = Math.ceil(delayRand * 2000);
        // Handle 1 and 2 differently
        switch (scale) {
            case 1:
                // The result will always be 1
                message.channel.send("The 1 sided die always lands on **1**!");
                break;
            case 2:
                // 2 Sided die doesn't makes sense, flip a coin instead.
                message.channel.send("Flipping a coin!")
                // Delay the second response and associate numbers with heads or tails results
                setTimeout(function () {
                    switch (output) {
                        case 1:
                            message.channel.send("The coin landed on **heads** (1)");
                            break;
                        case 2:
                            message.channel.send("The coin landed on **tails** (2)");
                            break;
                    }
                }, delay);
                break;
            default:
                // Let the user know command has been recieved and the output is coming
                message.channel.send(`Rolling a ${scale} sided die.`);
                setTimeout(function () {
                    // Output the result
                    message.channel.send(`The die landed on **${output}**`);
                }, delay);
        }
    }
};