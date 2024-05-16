import { Message } from "discord.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "github",
    aliases: ["repo"],
    description: "Gives link to repo.",
    execute(_client: Client, message: Message) {
        message.reply("<https://github.com/code123456789101112/discord-bot>");
    }
});
