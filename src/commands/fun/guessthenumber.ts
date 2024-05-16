import Client from "../../structs/client.js";

import Discord, { Message, Collection } from "discord.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "guessthenumber",
    description: "Starts a guess the number game.",
    aliases: ["gtn", "guess", "number", "guessnumber", "numberguess"],
    guildOnly: true,
    async execute(_client: Client, message: Message): Promise<void> {
        const first = await message.channel.send(
            "I'm thinking of a number between 1 and 500, guess it in the chat below."
        );

        const num: number = Math.round(Math.random() * 500);
        let guessedNum: number;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = (m: Message) => m.author.id == message.author.id;

        function guessTheNumber() {
            message.channel
                .awaitMessages({ filter, max: 1, time: 60000 })
                .then((collected: Collection<string, Discord.Message>) => {
                    if (isNaN(parseInt((collected.first() as Message).content))) {
                        return message.channel.send("Bro that's not even a number, ending the game.");
                    }

                    guessedNum = parseInt((collected.first() as Message).content);

                    if (guessedNum == num) {
                        message.channel.send(
                            `The number was ${num}!! <@${message.author.id}>, you took ${
                                ((collected.first() as Message).createdTimestamp - first.createdTimestamp) / 1000
                            } seconds!`
                        );
                        return;
                    } else if (guessedNum < num) {
                        message.channel.send(`${message.author.username} too low, guess another number.`);
                        guessTheNumber();
                    } else {
                        message.channel.send(`${message.author.username} too high, guess another number.`);
                        guessTheNumber();
                    }
                })
                .catch(() => {
                    message.reply("You have not guessed a number in the last 30 seconds, ending the game.");
                });
        }

        guessTheNumber();
    }
});
