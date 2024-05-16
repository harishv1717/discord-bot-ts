import ms from "parse-ms";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

import { Message } from "discord.js";

export default new Command({
    name: "daily",
    description: "Currency command that can be used to get coins once every day.",
    async execute(client: Client, message: Message): Promise<unknown> {
        const reward = 10000;
        const timeout = 86400000;

        const userMoney = await client.Currency.findByIdOrCreate(message.author.id, {
            _id: message.author.id,
            bal: 0,
            bank: 0,
            bankSpace: 1000
        });

        let userCD = await client.Cooldowns.findById(message.author.id + this.name);

        if (!userCD) {
            userCD = await client.Cooldowns.create({
                _id: message.author.id + this.name,
                cooldown: Date.now()
            });

            await userCD.save();

            userMoney.bal += reward;
            await userMoney.save();

            return message.channel.send("You collected your daily reward of 10,000 coins!");
        } else if (timeout - (Date.now() - userCD.cooldown) > 0) {
            interface msObj {
                days: number;
                hours: number;
                minutes: number;
                seconds: number;
                milliseconds: number;
                nanoseconds: number;
            }

            const time: msObj = ms(timeout - (Date.now() - userCD.cooldown));
            return message.channel.send(
                `You already collected your daily reward! Collect again in ${time.hours}h ${time.minutes}m ${time.seconds}s`
            );
        } else {
            userMoney.bal += reward;
            await userMoney.save();

            userCD.cooldown = Date.now();
            await userCD.save();

            return message.channel.send("You collected your daily reward of 10,000 coins!");
        }
    }
});
