import { ContextMenuInteraction, Interaction, MessageAttachment, TextChannel } from "discord.js";
import Client from "../structs/client.js";
import { SlashCommand } from "../structs/command.js";

export default async (client: Client, interaction: Interaction): Promise<void> => {
    if (interaction.isCommand()) client.emit("slashCommand", interaction);
    else if (interaction.isMessageComponent() && interaction.componentType === "BUTTON") {
        if (/^test/.test(interaction.customId)) {
            await interaction
                .reply({
                    content: `${interaction.user}, you pressed my button!`,
                    ephemeral: true
                })
                .catch(console.error);
        } else if (/^close-ticket$/.test(interaction.customId)) {
            const ticket = await client.Tickets.findById(interaction.channelId);
            if (!ticket) return;

            if (!interaction.channel) await client.channels.fetch(interaction.channelId as `${bigint}`);

            const buffer = Buffer.from(ticket.conversation, "utf-8");
            (client.channels.cache.get(client.config.ids.channels.admin) as TextChannel).send({
                content: `Ticket conversation for ${ticket.user}`,
                files: [new MessageAttachment(buffer, `${ticket.name}.txt`)]
            });

            interaction.channel?.delete();
            await client.Tickets.delete(ticket);
        }
    } else if (interaction.isContextMenu()) {
        const { options: args, commandName } = interaction as ContextMenuInteraction;

        const command: SlashCommand = client.slashCommands.get(commandName) as SlashCommand;
        if (!command) return;

        command.execute(client, interaction, args);
    }
};
