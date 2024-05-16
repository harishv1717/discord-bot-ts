import { User, Message } from "discord.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "give",
    usage: "<@user> <money>",
    description: "Gives money to someone else.",
    async execute(client: Client, message: Message, args: string[]): Promise<unknown> {
        const authorBal = await client.Currency.findByIdOrCreate(message.author.id, {
            _id: message.author.id,
            bal: 0,
            bank: 0,
            bankSpace: 1000
        });

        const user: User = message.mentions.users.first() || (await client.users.fetch(args[0] as `${bigint}`));
        if (!user) return message.channel.send("You didn't say who to give money to!");

        const userBal = await client.Currency.findByIdOrCreate(user.id, {
            _id: user.id,
            bal: 0,
            bank: 0,
            bankSpace: 1000
        });

        if (isNaN(parseInt(args[1]))) return message.channel.send("That's not a valid amount");

        const amount: number = parseInt(args[1]);
        if (amount > authorBal.bal) return message.channel.send("You don't have enough for this.");

        authorBal.bal -= amount;
        await authorBal.save();

        userBal.bal += amount;
        await userBal.save();

        message.channel.send(`You successfully gave ${amount.toLocaleString()} to ${user.username}!`);
    }
});
