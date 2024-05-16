import { User, Message } from "discord.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "setbal",
    usage: "<@user> <bal>",
    description: "sets a user's balance",
    devOnly: true,
    async execute(client: Client, message: Message, args: string[]): Promise<unknown> {
        const user: User = message.mentions.users.first() || (await client.users.fetch(args[0] as `${bigint}`));
        if (!user) return;

        const userMoney = await client.Currency.findByIdOrCreate(user.id, {
            _id: user.id,
            bal: 0,
            bank: 0,
            bankSpace: 1000
        });

        userMoney.bal = parseInt(args[1]);
        await userMoney.save();

        message.channel.send("You set the balance.");
    }
});
