import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

import { Message, MessageEmbed, User } from "discord.js";

export default new Command({
    name: "tictactoe",
    aliases: ["tictac", "tactoe", "tictoetac", "tactoetic", "toetactic", "ttt"],
    description: "tic tac toe",
    usage: "<@user>",
    execute(_client: Client, message: Message) {
        const { author } = message;
        const user = message.mentions.users.first() as User;

        if (!user) return message.reply("You didn't say who to play against!");

        let authorScore = "";
        let userScore = "";

        let board: string | string[] = "⚪⚪⚪\n⚪⚪⚪\n⚪⚪⚪";
        message.channel.send(board);

        async function authorTurn() {
            const winResult = checkWin(author, authorScore);
            if (winResult) endGame(message, winResult);

            const drawResult = checkDraw(board as string);
            if (drawResult) endGame(message, drawResult);

            message.channel.send(
                `${author}, where do you want to place your marker? Use letters to specify the row and numbers to specify the column.\nFor example: \`a1\` would be top-left and \`b2\` would be center.`
            );

            const filter = (m: Message) => m.author.id === author.id && /[abc][123]/.test(m.content);
            message.channel
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .awaitMessages({ filter, max: 1, time: 30000 })
                .then(messages => {
                    const spot = spotToNum((messages.first() as Message).content);

                    board = (board as string).split("\n").join("").split("");
                    if (board[spot] === "⚪") board[spot] = "❌";
                    else {
                        message.channel.send("What are you doing, that spot is taken, pick another spot.");
                        return authorTurn();
                    }

                    authorScore += `${spot} `;

                    board[2] += "\n";
                    board[5] += "\n";
                    board = board.join("");
                    message.channel.send(board);

                    userTurn();
                })
                .catch(() => message.reply("You have not responded, ending the game."));
        }

        async function userTurn() {
            const drawResult = checkDraw(board as string);
            if (drawResult) endGame(message, drawResult);

            const winResult = checkWin(user, userScore);
            if (winResult) endGame(message, winResult);

            message.channel.send(
                `${user}, where do you want to place your marker? Use letters to specify the row and numbers to specify the column.\nFor example: \`a1\` would be top-left and \`b2\` would be center.`
            );

            const filter = (m: Message) => m.author.id === user.id && /[abc][123]/.test(m.content);
            message.channel
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .awaitMessages({ filter, max: 1, time: 30000 })
                .then(messages => {
                    const spot = spotToNum((messages.first() as Message).content);

                    board = (board as string).split("\n").join("").split("");
                    if (board[spot] === "⚪") board[spot] = "⭕";
                    else {
                        message.channel.send("What are you doing, that spot is taken, pick another spot.");
                        return userTurn();
                    }

                    userScore += `${spot} `;

                    board[2] += "\n";
                    board[5] += "\n";
                    board = board.join("");
                    message.channel.send(board);

                    authorTurn();
                })
                .catch(() => message.reply("You have not responded, ending the game."));
        }

        const turnFunctions = [authorTurn, userTurn];
        turnFunctions[Math.round(Math.random())]();
    }
});

function spotToNum(spot: string): number {
    if (/^a/.test(spot)) return parseInt(spot.replace(/[^\d]/g, "")) - 1;
    else if (/^b/.test(spot)) return parseInt(spot.replace(/[^\d]/g, "")) + 2;
    else return parseInt(spot.replace(/[^\d]/g, "")) + 5;
}

function checkDraw(board: string) {
    return !board.includes("⚪") ? { draw: true, win: false, winner: undefined } : false;
}

function checkWin(user: User, score: string | string[]) {
    score = (score as string).split(" ").sort().join(" ") as string;
    if (
        /0.+1.+2/.test(score) ||
        /3.+4.+5/.test(score) ||
        /6.+7.+8/.test(score) ||
        /0.+3.+6/.test(score) ||
        /1.+4.+7/.test(score) ||
        /2.+5.+8/.test(score) ||
        /0.+4.+8/.test(score) ||
        /2.+4.+6/.test(score)
    )
        return { win: true, draw: false, winner: user };
    else return false;
}

function endGame(message: Message, result: { win: boolean; draw: boolean; winner: User | undefined }) {
    if (result.draw) {
        const drawEmbed = new MessageEmbed().setTitle("It's a tie!").setFooter("bruh a tie").setColor("YELLOW");
        return message.channel.send({ embeds: [drawEmbed] });
    } else if (result.win) {
        const winEmbed = new MessageEmbed()
            .setTitle("Game Over!")
            .setDescription(`${result.winner}, you won!!`)
            .setFooter("nice win")
            .setColor("GREEN");
        return message.channel.send({ embeds: [winEmbed] });
    }
}
