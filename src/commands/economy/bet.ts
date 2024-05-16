import MessageEmbed from "../../structs/embed.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

import { Message } from "discord.js";

export default new Command({
    name: "bet",
    aliases: ["gamble"],
    usage: "<amount>",
    description: "gamble command",
    cooldown: 6,
    async execute(client: Client, message: Message, args: string[]): Promise<unknown> {
        const userMoney = await client.Currency.findByIdOrCreate(message.author.id, {
            _id: message.author.id,
            bal: 0,
            bank: 0,
            bankSpace: 0
        });

        const bet = parseInt(args[0]);

        if (!userMoney)
            return message.channel.send("You haven't started using currency yet. Use `=start` to get started.");
        else if (!args[0] || isNaN(parseInt(args[0]))) return message.channel.send("You didn't say how much to bet!");
        else if (bet < 500) return message.channel.send("You can't bet less than 500.");
        else if (bet > 100000) return message.channel.send("You can't bet more than 100,000.");
        else if (bet > userMoney.bal)
            return message.channel.send("You don't have enough money in your wallet for that!");

        const userRoll: number = client.randomInt(0, 10);
        const botRoll: number = client.randomInt(0, 10);

        const embed: MessageEmbed = new MessageEmbed(message.author)
            .setTitle(`${message.author.username}'s gambling game`)
            .addFields({ name: "Your Roll", value: `${userRoll}` }, { name: "Bot's Roll", value: `${botRoll}` });
        if (userRoll > botRoll) {
            embed.setColor("#05ed43");
            embed.setDescription("You Won!!");

            const winAmount = client.randomInt(bet * 0.1, bet * 2);
            userMoney.bal += winAmount;
            await userMoney.save();

            message.channel.send({
                content: `You won ${winAmount.toLocaleString()}!!`,
                embeds: [embed]
            });
        } else if (userRoll === botRoll) {
            embed.setColor("#ebcf00");
            embed.setDescription("It's a tie!");

            message.channel.send({
                content: "You didn't win or lose anything!",
                embeds: [embed]
            });
        } else {
            embed.setColor("#ff0000");
            embed.setDescription("You lost!!");

            userMoney.bal -= bet;
            await userMoney.save();

            message.channel.send({
                content: "You lost your entire bet!",
                embeds: [embed]
            });
        }
    }
});
