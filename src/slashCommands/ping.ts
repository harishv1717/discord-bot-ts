import { CommandInteraction, CommandInteractionOptionResolver } from "discord.js";
import { SlashCommand } from "../structs/command.js";

import Client from "../structs/client.js";
import { ApplicationCommandOptionType } from "discord-api-types";

export default new SlashCommand({
    data: {
        name: "ping",
        description: "Shows the bot's ping.",
        options: [
            {
                name: "type",
                type: ApplicationCommandOptionType.String,
                description: "The type of ping to show.",
                choices: [
                    {
                        name: "Webscocket Heartbeat",
                        value: "ws"
                    },
                    {
                        name: "Roundtrip Latency",
                        value: "rtp"
                    }
                ],
                required: false
            }
        ],
        default_permission: true
    },
    async execute(client: Client, interaction: CommandInteraction, options: CommandInteractionOptionResolver) {
        if (options.getString("type") && /ws/i.test(options.getString("type") as string)) {
            await interaction.reply(`Pong! \`${client.ws.ping}ms\``);
        } else if (options.getString("type") && /rtp/i.test(options.getString("type") as string)) {
            const ping = Date.now() - interaction.createdTimestamp;

            await interaction.reply("Pong!");
            await interaction.editReply(`Pong! \`${ping}ms\``);
        } else await interaction.reply("Pong!");
    }
});
