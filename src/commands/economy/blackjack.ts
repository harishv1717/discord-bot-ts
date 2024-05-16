import Discord, { Message, Collection, CollectorFilter } from "discord.js";
import MessageEmbed from "../../structs/embed.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "blackjack",
    aliases: ["bj"],
    description: "the card game",
    usage: "<amount>",
    cooldown: 8,
    async execute(client: Client, message: Message, args: string[]): Promise<unknown> {
        const userMoney = await client.Currency.findByIdOrCreate(message.author.id, {
            _id: message.author.id,
            bal: 0,
            bank: 0,
            bankSpace: 1000
        });

        const bet: number = parseInt(args[0]);

        if (!args[0] || isNaN(bet)) return message.channel.send("You didn't say how much to bet!");
        else if (bet < 500) return message.channel.send("You can't bet less than 500.");
        else if (bet > 100000) return message.channel.send("You can't bet more than 100,000.");
        else if (bet > userMoney.bal)
            return message.channel.send("You don't have enough money in your wallet for that!");

        const cards: string[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        const values: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];

        const deal = (): string => cards[client.randomInt(0, 12)];

        let userCards: string[] = [deal(), deal()];
        let dealerCards: string[] = [deal(), deal()];

        let stood = false;

        const getValue = (card: string): number => values[cards.indexOf(card)];

        const addCards = (cardArray: string[]): number => {
            const aceArray = cardArray.filter((card: string) => card === "A");
            let sum = cardArray.reduce((a: number, b: string) => a + getValue(b), 0);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const _ of aceArray) sum += sum + 10 <= 21 ? 10 : 0;
            return sum;
        };

        while (addCards(userCards) === 21 || addCards(dealerCards) === 21) {
            userCards = [deal(), deal()];
            dealerCards = [deal(), deal()];
        }

        const checkScore = (): { msg: string; win: boolean | null } | void => {
            const user: number = addCards(userCards);
            const dealer: number = addCards(dealerCards);

            if (user > 21) return { msg: "You lose, Busted! You went over 21!", win: false };
            else if (dealer > 21) return { msg: "You win! Your opponent was busted!", win: true };
            else if (dealer === 21) return { msg: "You lose! Your opponent has exactly 21!", win: false };
            else if (user === 21) return { msg: "You win! You have 21!", win: true };
            else if (user <= 21 && userCards.length === 5)
                return {
                    msg: "You win! You took 5 cards without going over 21!",
                    win: true
                };
            else if (dealer <= 21 && dealerCards.length === 5)
                return {
                    msg: "You lose! Your opponent took 5 cards without going over 21!",
                    win: false
                };
            else if (dealer === user && stood) return { msg: "It's a tie!", win: null };
            else if (dealer > user && stood)
                return {
                    msg: "You lose! You have less than your opponent!",
                    win: false
                };
            else if (user > dealer && stood) return { msg: "You win! You have more than the dealer!", win: true };
            else return;
        };

        const endGame = async (result: { msg: string; win: boolean | null }) => {
            const finalEmbed: MessageEmbed = new MessageEmbed(message.author)
                .setTitle(result.msg)
                .addFields([
                    { name: "Your Cards", value: `\`${userCards.join("`, `")}\`` },
                    { name: "Dealer's Cards", value: `\`${dealerCards.join("`, `")}\`` }
                ])
                .setDescription(`Your total: ${addCards(userCards)}\nDealer's total: ${addCards(dealerCards)}`);
            if (result.win) {
                const winAmount: number = client.randomInt(bet * 0.1, bet * 2);

                finalEmbed.setFooter("nice win");
                finalEmbed.setColor("#05ed43");

                userMoney.bal += winAmount;
                await userMoney.save();

                message.channel.send({
                    content: `You won ${winAmount.toLocaleString()}!`,
                    embeds: [finalEmbed]
                });
            } else if (result.win === null) {
                finalEmbed.setFooter("bruh a tie");
                finalEmbed.setColor("#ebcf00");

                message.channel.send({
                    content: "You lost no coins!",
                    embeds: [finalEmbed]
                });
            } else {
                finalEmbed.setFooter("lol u lost");
                finalEmbed.setColor("#ff0000");

                userMoney.bal -= bet;
                await userMoney.save();

                message.channel.send({
                    content: "You lost your entire bet!",
                    embeds: [finalEmbed]
                });
            }
        };

        const gameEmbed = () => {
            const embed: MessageEmbed = new MessageEmbed(message.author)
                .setTitle(`${message.author.username}'s blackjack game:`)
                .addFields([
                    { name: "Your Cards", value: `\`${userCards.join("`, `")}\`` },
                    { name: "Dealer's Cards", value: `\`${dealerCards[0]}\`, \`?\`` }
                ])
                .setDescription(
                    `Your total: ${addCards(
                        userCards
                    )}\nDealer's total: ?\n\nType \`h\` to hit, \`s\` to stand, or \`e\` to end.`
                );
            message.channel.send({ embeds: [embed] });
        };

        const play = () => {
            gameEmbed();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filter: CollectorFilter<any> = (m: Message) =>
                m.author.id === message.author.id && /^(h|s|e)/i.test(m.content);
            message.channel
                .awaitMessages({ filter, max: 1, time: 15000 })
                .then((collected: Collection<string, Discord.Message>) => {
                    if ((collected.first() as Message).content.toLowerCase().startsWith("h")) {
                        userCards.push(deal());

                        const result: { msg: string; win: boolean | null } | void = checkScore();
                        result ? endGame(result) : play();
                    } else if ((collected.first() as Message).content.toLowerCase().startsWith("s")) {
                        stood = true;

                        while (addCards(dealerCards) < 17) dealerCards.push(deal());

                        const result: { msg: string; win: boolean | null } | void = checkScore();
                        if (result) endGame(result);
                    } else return message.channel.send("You ended the game.");
                })
                .catch(() => message.channel.send("You didn't answer in the last 15 seconds, ending the game."));
        };

        play();
    }
});
