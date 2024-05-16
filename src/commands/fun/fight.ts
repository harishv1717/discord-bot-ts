import Client from "../../structs/client.js";

import Discord, { Message, Collection, User } from "discord.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "fight",
    description: "Starts a fight against the pinged user.",
    guildOnly: true,
    usage: "<@user>",
    execute(_client: Client, message: Message): unknown {
        const p1: User = message.author;
        const p2: User = message.mentions.users.first() as User;
        let p1hp = 15;
        let p2hp = 15;

        if (!p2 || p2.bot) return message.channel.send("no");
        if (!message.mentions.users.size) return message.channel.send("You didn't mention anyone.");

        message.channel.send(`Okay, starting a fight between ${p1.username} and ${p2.username}`);

        function p1turn() {
            if (p1hp <= 0) return message.channel.send(`${p2}, you won!!!`);

            message.channel.send(`${p1.username}, what do you want to do? \`punch\`, \`defend\`, or \`quit\`?`);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filter: any = (m: Message) =>
                (m.author.id == p1.id && m.content == "punch") || m.content == "defend" || m.content == "quit";
            message.channel
                .awaitMessages({ filter, max: 1, time: 20000 })
                .then((collected: Collection<string, Discord.Message>) => {
                    if ((collected.first() as Message).content == "punch") {
                        p2hp -= Math.round(Math.random() * 4);
                        message.channel.send(`You punched and left ${p2.username} with ${p2hp} health!`);
                        p2turn();
                    } else if ((collected.first() as Message).content == "defend") {
                        p1hp += Math.round(Math.random() * 4);
                        message.channel.send(`${p1.username}, You defended and now you have ${p1hp} health!`);
                        p2turn();
                    } else if ((collected.first() as Message).content == "quit") {
                        return message.channel.send("You ended the fight.");
                    }
                })
                .catch(() => {
                    message.channel.send("You have not made a valid decision in the last 10 seconds, ending the game.");
                });
        }
        function p2turn() {
            if (p2hp <= 0) return message.channel.send(`${p1}, you won!!!`);

            message.channel.send(`${p2.username}, what do you want to do? \`punch\`, \`defend\`, or \`quit\`?`);
            message.channel
                .awaitMessages({
                    filter: m =>
                        (m.author.id == p2.id && m.content == "punch") || m.content == "defend" || m.content == "quit",
                    max: 1,
                    time: 20000
                })
                .then((collected: Collection<string, Discord.Message>) => {
                    if ((collected.first() as Message).content == "punch") {
                        p1hp -= Math.round(Math.random() * 4);
                        message.channel.send(`You punched and left ${p1.username} with ${p1hp} health!`);
                        p1turn();
                    } else if ((collected.first() as Message).content == "defend") {
                        p2hp += Math.round(Math.random() * 4);
                        message.channel.send(`${p2.username}, You defended and now you have ${p2hp} health!`);
                        p1turn();
                    } else if ((collected.first() as Message).content == "quit") {
                        return message.channel.send("You ended the fight.");
                    }
                })
                .catch(() => {
                    message.channel.send("You have not made a valid decision in the last 20 seconds, ending the game.");
                });
        }

        p1turn();
    }
});
