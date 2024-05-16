import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

import { Message } from "discord.js";
import MessageEmbed from "../../structs/embed.js";

export default new Command({
    name: "membercount",
    aliases: ["m", "mc", "members", "memberscount", "countmembers", "countmember"],
    description: "Shows the server's member count",
    execute(client: Client, message: Message) {
        message.reply({
            embeds: [
                new MessageEmbed(message.author)
                    .setTitle(`${client.config.serverName} Member Count`)
                    .setThumbnail(message.guild?.iconURL({ dynamic: true }) as string)
                    .addFields(
                        { name: "Total:", value: `${message.guild?.memberCount}` },
                        {
                            name: "Humans:",
                            value: `${(message.guild?.memberCount as number) - client.botCount}`
                        },
                        { name: "Bots:", value: `${client.botCount}` }
                    )
            ]
        });
    }
});
