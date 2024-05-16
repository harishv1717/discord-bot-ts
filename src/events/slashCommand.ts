import ms from "parse-ms";
import { Collection, CommandInteraction } from "discord.js";

import { SlashCommand } from "../structs/command";
import Client from "../structs/client";

export default async (client: Client, interaction: CommandInteraction): Promise<unknown> => {
    const { options: args, commandName } = interaction;

    const command: SlashCommand = client.slashCommands.get(commandName) as SlashCommand;
    if (!command) return;

    const { cooldowns } = client;

    if (!cooldowns.has((command.data.toJSON().name as string) + "/"))
        cooldowns.set((command.data.toJSON().name as string) + "/", new Collection());

    const now: number = Date.now();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timestamps: any = cooldowns.get((command.data.toJSON().name as string) + "/");
    const cooldownAmount: number = (command.cooldown as number) * 1000;

    if (timestamps?.has(interaction.user.id)) {
        const expirationTime: number = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = ms(expirationTime - now);
            return interaction.reply({
                content: `Please wait ${timeLeft.minutes}m ${timeLeft.seconds}s before reusing the \`${
                    command.data.toJSON().name
                }\` command.`,
                ephemeral: true
            });
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    command.execute(client, interaction, args);
};
