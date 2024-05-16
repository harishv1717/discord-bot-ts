import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

import { Message } from "discord.js";

export default new Command({
    name: "withdraw",
    aliases: ["with"],
    usage: "<amount>",
    description: "Currency command which withdraws money from your bank.",
    async execute(client: Client, message: Message, args: string[]): Promise<unknown> {
        const userMoney = await client.Currency.findByIdOrCreate(message.author.id, {
            _id: message.author.id,
            bal: 0,
            bank: 0,
            bankSpace: 1000
        });

        if (!args[0] || isNaN(parseInt(args[0])))
            return message.channel.send("Either you didn't say how much to withdraw or that is not a valid amount.");

        const amount: number = parseInt(args[0]);
        if ((userMoney?.bank as number) < amount)
            return message.channel.send("You don't have enough money in your bank for this.");

        userMoney.bank -= amount;
        userMoney.bal += amount;

        await userMoney.save();
        message.channel.send(`You successfully withdrew ${amount.toLocaleString()} coins!`);
    }
});
