import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

import { Message } from "discord.js";

export default new Command({
    name: "beg",
    cooldown: 15,
    description: "Currency command which raises balance by random number.",
    async execute(client: Client, message: Message): Promise<unknown> {
        const userMoney = await client.Currency.findByIdOrCreate(message.author.id, {
            _id: message.author.id,
            bal: 0,
            bank: 0,
            bankSpace: 1000
        });

        if (!userMoney)
            return message.channel.send("You haven't started using currency yet. Use `=start` to get started.");

        const random = client.randomInt(5, 400);
        userMoney.bal += random;
        await userMoney.save();

        message.channel.send(`You begged and received ${random.toLocaleString()} coins!`);
    }
});
