import {
    GuildMember,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    TextChannel,
    Message
} from "discord.js";

import MessageEmbed from "../structs/embed.js";
import Client from "../structs/client.js";

export default async (client: Client, message: Message): Promise<unknown> => {
    if (message.channel.type === "DM" && !message.author.bot) {
        const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId("ticket-yes").setStyle("SUCCESS").setLabel("Yes!"),
            new MessageButton().setCustomId("ticket-no").setStyle("DANGER").setLabel("No!")
        );

        const msg = await message.channel.send({
            content: `Would you like to open a ticket with topic: \`${message.content}\`?`,
            components: [row]
        });

        const filter = (interaction: MessageComponentInteraction) => interaction.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({
            filter,
            max: 1,
            time: 30000
        });

        collector.on("collect", async (interaction: MessageComponentInteraction) => {
            if (interaction.customId === "ticket-no") {
                return interaction.update({ content: "Ok, no ticket today then.", components: [] });
            }

            await interaction.update({ content: "Opening ticket...", components: [] });

            const channel = await client.guilds.cache
                .get(client.config.ids.guild)
                ?.channels.create(`ticket-${interaction.user.username}`, {
                    type: "GUILD_TEXT",
                    permissionOverwrites: [
                        {
                            id: client.config.ids.guild,
                            deny: "VIEW_CHANNEL"
                        },
                        {
                            id: interaction.user.id,
                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS", "EMBED_LINKS", "ATTACH_FILES"]
                        }
                    ]
                });

            const closeRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("close-ticket")
                    .setStyle("DANGER")
                    .setEmoji("🔒")
                    .setLabel("Close Ticket")
            );

            const embeds = [
                new MessageEmbed(interaction.user)
                    .setTitle(`${interaction.user.username}'s ticket`)
                    .addField("Ticket Topic:", message.content)
                    .setFooter("An admin will be with you soon!")
            ];

            channel?.send({
                content: `<@&${client.config.ids.roles.admin}>`,
                embeds,
                components: [closeRow]
            });
            (msg as Message).edit(`Ticket open at <#${channel?.id}>!`);

            await client.Tickets.create({
                _id: channel?.id,
                name: `ticket-${message.author.tag}-${message.createdTimestamp}`,
                conversation: "\n",
                user: message.author.username
            });
        });
    } else if ((message.channel as TextChannel).name?.startsWith("ticket") && message.author.id !== client.user?.id) {
        const ticket = await client.Tickets.findById(message.channel.id);
        if (!ticket) return;

        ticket.conversation = `${ticket.conversation.length ? `${ticket.conversation}\n` : ""}${
            message.author.username
        }: ${message.content}`;
        await ticket.save();
    }

    client.emit("command", message);
};
