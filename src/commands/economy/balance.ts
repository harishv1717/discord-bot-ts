import { User, Message } from "discord.js";
import MessageEmbed from "../../structs/embed.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "balance",
    aliases: ["bal", "money"],
    description: "Currency command that shows the user's balance.",
    usage: "[@user]",
    async execute(client: Client, message: Message): Promise<void> {
        const user: User = message.mentions.users.first() || message.author;

        const userMoney = await client.Currency.findByIdOrCreate(user.id, {
            _id: user.id,
            bal: 0,
            bank: 0,
            bankSpace: 1000
        });

        const embed: MessageEmbed = new MessageEmbed(message.author)
            .setTitle(`${user.username}'s balance:`)
            .addFields([
                { name: "Wallet:", value: `${userMoney.bal.toLocaleString()}` },
                {
                    name: "Bank:",
                    value: `${userMoney.bank.toLocaleString()}/${userMoney.bankSpace.toLocaleString()}`
                }
            ])
            .setFooter("wow look at all that cash");
        message.channel.send({ embeds: [embed] });
    }
});
