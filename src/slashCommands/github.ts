import { CommandInteraction } from "discord.js";

import Client from "../structs/client.js";
import { SlashCommand } from "../structs/command.js";

export default new SlashCommand({
    data: { name: "github", description: "Gives link to repo.", default_permission: true },
    execute(_client: Client, interaction: CommandInteraction) {
        interaction.reply({
            content: "https://github.com/code123456789101112/discord-bot",
            ephemeral: true
        });
    }
});
