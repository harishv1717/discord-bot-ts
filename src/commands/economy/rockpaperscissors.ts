import Discord, { Message, Collection } from "discord.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

import MessageEmbed from "../../structs/embed.js";

export default new Command({
    name: "rockpaperscissors",
    aliases: ["rps", "rockpaper", "paperscissors", "rockscissors"],
    description: "gamble command",
    usage: "<amount>",
    cooldown: 7,
    async execute(client: Client, message: Message, args: string[]): Promise<unknown> {
        const userMoney = await client.Currency.findByIdOrCreate(message.author.id, {
            _id: message.author.id,
            bal: 0,
            bank: 0,
            bankSpace: 1000
        });

        const bet: number = parseInt(args[0]);

        if (!userMoney)
            return message.channel.send("You haven't started using currency yet. Use `=start` to get started.");
        else if (!args[0] || isNaN(parseInt(args[0]))) return message.channel.send("You didn't say how much to bet!");
        else if (bet < 500) return message.channel.send("You can't bet less than 500.");
        else if (bet > 100000) return message.channel.send("You can't bet more than 100,000.");
        else if (bet > userMoney.bal)
            return message.channel.send("You don't have enough money in your wallet for that!");

        const choices: string[] = ["rock", "paper", "scissors"];
        const botChoice: string = choices[client.randomInt(0, 2)];

        const checkWin = (choice: "rock" | "paper" | "scissors") => {
            if (botChoice === choice) return { msg: "It's a tie!", win: null };
            else if (botChoice === "rock") {
                if (choice === "paper") return { msg: "You won!", win: true };
                else return { msg: "You lost!", win: false };
            } else if (botChoice === "paper") {
                if (choice === "rock") return { msg: "You lost!", win: false };
                else return { msg: "You won!", win: true };
            } else if (botChoice === "scissors") {
                if (choice === "rock") return { msg: "You won!", win: true };
                else return { msg: "You lost!", win: false };
            }
        };

        message.channel.send("Okay, pick: rock (`r`), paper (`p`), or scissors (`s`)");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = (m: Message) => m.author.id === message.author.id && /^(r|p|s)/i.test(m.content);
        message.channel
            .awaitMessages({ filter, max: 1, time: 15000, errors: ["time"] })
            .then(async (collected: Collection<string, Discord.Message>) => {
                const content = (collected.first() as Message).content.toLowerCase();

                let result: { msg: string; win: boolean } | { msg: string; win: null } | undefined;
                let choice: "rock" | "paper" | "scissors";
                if (content.startsWith("r")) {
                    result = checkWin("rock");
                    choice = "rock";
                } else if (content.startsWith("p")) {
                    result = checkWin("paper");
                    choice = "paper";
                } else if (content.startsWith("s")) {
                    result = checkWin("scissors");
                    choice = "scissors";
                } else return message.channel.send("You ended the game.");

                const gameEmbed: MessageEmbed = new MessageEmbed(message.author)
                    .setTitle(`${message.author.username}, ${result?.msg}`)
                    .addFields([
                        { name: "Your choice", value: choice },
                        { name: "Bot's choice:", value: botChoice }
                    ]);

                const winAmount: number = client.randomInt(bet * 0.25, bet * 1.5);

                if (result?.win) {
                    userMoney.bal += winAmount;
                    await userMoney.save();

                    gameEmbed.setColor("#00ff00");
                    message.channel.send({
                        content: `You won ${winAmount.toLocaleString()}!!`,
                        embeds: [gameEmbed]
                    });
                } else if (result?.win === null) {
                    gameEmbed.setColor("#ffff00");
                    message.channel.send({
                        content: "It was a tie. You lost nothing",
                        embeds: [gameEmbed]
                    });
                } else {
                    userMoney.bal -= bet;
                    await userMoney.save();

                    gameEmbed.setColor("#ff0000");
                    message.channel.send({
                        content: "You lost your entire bet!",
                        embeds: [gameEmbed]
                    });
                }
            })
            .catch(() => message.channel.send("You didn't answer, ending the game"));
    }
});
