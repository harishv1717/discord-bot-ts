import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

import { Message } from "discord.js";

export default new Command({
    name: "ping",
    description: "Shows the bot's ping.",
    cooldown: 10,
    async execute(client: Client, message: Message, args: string[]): Promise<void> {
        const [type] = args;

        if (type && /^ws$/i.test(type)) {
            message.reply(`Pong! \`${client.ws.ping}ms\``);
        } else if (type && /^rtp$/i.test(type)) {
            const m = await message.reply("Pong!");

            await m.edit(`Pong! \`${m.createdTimestamp - message.createdTimestamp}ms\``);
        } else await message.reply("Pong!");
    }
});
