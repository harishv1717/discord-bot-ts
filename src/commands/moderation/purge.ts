import { Message, TextChannel } from "discord.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "purge",
    usage: "<number-of-messages>",
    permissions: "ADMINISTRATOR",
    aliases: ["clear", "c"],
    description: "Clears specified number of messages in a channel.",
    async execute(_client: Client, message: Message, args: string[]): Promise<unknown> {
        if (isNaN(parseInt(args[0]))) return message.channel.send("You didn't say how many messages to delete!");

        const messages = await message.channel.messages.fetch({
            limit: parseInt(args[0]) <= 99 ? parseInt(args[0]) + 1 : 100
        });

        (message.channel as TextChannel).bulkDelete(messages);
    }
});
