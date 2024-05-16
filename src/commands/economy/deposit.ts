import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

import { Message } from "discord.js";

export default new Command({
    name: "deposit",
    aliases: ["dep"],
    usage: "<amount>",
    description: "Currency command which deposits money into your bank.",
    async execute(client: Client, message: Message, args: string[]): Promise<unknown> {
        const userMoney = await client.Currency.findByIdOrCreate(message.author.id, {
            _id: message.author.id,
            bal: 0,
            bank: 0,
            bankSpace: 1000
        });

        if (!args[0] || isNaN(parseInt(args[0])))
            return message.channel.send("Either you didn't say how much to deposit or that is not a valid amount.");

        const amount: number = parseInt(args[0]);
        if ((userMoney?.bal as number) < amount) return message.channel.send("You don't have enough money for this.");
        else if (amount + (userMoney?.bank as number) > (userMoney?.bankSpace as number))
            return message.channel.send("Your bank isn't big enough for this");

        userMoney.bal -= amount;
        userMoney.bank += amount;

        await userMoney.save();
        message.channel.send(`You successfully deposited ${amount.toLocaleString()} coins!`);
    }
});
