import ms from "parse-ms";
import { Message } from "discord.js";

import MessageEmbed from "../../structs/embed.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "work",
    description: "Currency command that can be used every hour.",
    usage: "[list or job-name]",
    async execute(client: Client, message: Message, args: string[]): Promise<unknown> {
        const timeout = 3600000;

        const userMoney = await client.Currency.findByIdOrCreate(message.author.id, {
            _id: message.author.id,
            bal: 0,
            bank: 0,
            bankSpace: 1000
        });

        let userJobs = await client.Jobs.findById(message.author.id);
        let userCD = await client.Cooldowns.findById(message.author.id + this.name);

        if (!args[0]) {
            if (!userJobs) {
                return message.channel.send("You don't have a job yet, use `=work list` to find one.");
            } else if (!userCD) {
                userCD = await client.Cooldowns.create({
                    _id: message.author.id + this.name,
                    cooldown: Date.now()
                });

                userMoney.bal += userJobs.salary;
                userMoney.bankSpace += 500;

                await userMoney.save();
                message.channel.send(`You worked as a ${userJobs.job} and earned ${userJobs.salary.toLocaleString()}!`);
            } else if (timeout - (Date.now() - userCD.cooldown) > 0) {
                const time = ms(timeout - (Date.now() - userCD.cooldown));

                return message.channel.send(
                    `You already collected your work reward! Collect again in ${time.hours}h ${time.minutes}m ${time.seconds}s`
                );
            } else {
                userCD.cooldown = Date.now();
                await userCD.save();

                userMoney.bal += userJobs.salary;
                userMoney.bankSpace += 500;

                await userMoney.save();
                message.channel.send(`You worked as a ${userJobs.job} and earned ${userJobs.salary.toLocaleString()}!`);
            }
        } else if (args[0] === "list") {
            const embed: MessageEmbed = new MessageEmbed(message.author)
                .setTitle("Jobs Available")
                .addFields(
                    {
                        name: "Teacher",
                        value: "This job has a low salary and isn't that good."
                    },
                    {
                        name: "Police",
                        value: "This job has an okay salary but still isn't that good."
                    },
                    {
                        name: "Lawyer",
                        value: "This job is respectable and has a pretty good salary."
                    },
                    {
                        name: "President",
                        value: "This is the best job with the best salary!"
                    }
                )
                .setDescription("Use `=work <job name>` to start working!")
                .setColor("#ff0000");
            return message.channel.send({ embeds: [embed] });
        } else if (args[0].toLowerCase() === "teacher") {
            if (!userJobs) {
                userJobs = await client.Jobs.create({
                    _id: message.author.id,
                    job: "teacher",
                    salary: 650
                });
            } else {
                userJobs.job = "teacher";
                userJobs.salary = 650;
            }

            await userJobs.save();
            return message.channel.send(
                "You now work as a teacher and earn 650 coins an hour! You can start working by using `=work`."
            );
        } else if (args[0].toLowerCase() === "police") {
            if (userMoney.bal < 10000)
                return message.channel.send("You need 10,000 coins to be able to sign up for this job");

            if (!userJobs) {
                userJobs = await client.Jobs.create({
                    id: message.author.id,
                    job: "police",
                    salary: 1000
                });
            } else {
                userJobs.job = "police";
                userJobs.salary = 1000;
            }

            await userJobs.save();
            return message.channel.send(
                "You now work as a police officer and earn 1,000 coins an hour! You can start working by using `=work`."
            );
        } else if (args[0].toLowerCase() === "lawyer") {
            if (userMoney.bal < 25000)
                return message.channel.send("You need 25,000 coins to be able to sign up for this job");

            if (!userJobs) {
                userJobs = await client.Jobs.create({
                    id: message.author.id,
                    job: "lawyer",
                    salary: 5000
                });
            } else {
                userJobs.job = "lawyer";
                userJobs.salary = 5000;
            }

            await userJobs.save();
            return message.channel.send(
                "You now work as a lawyer and earn 5,000 coins an hour! You can start working by using `=work`."
            );
        } else if (args[0].toLowerCase() === "president") {
            if (userMoney.bal < 50000)
                return message.channel.send("You need 50,000 coins to be able to sign up for this job");

            if (!userJobs) {
                userJobs = await client.Jobs.create({
                    id: message.author.id,
                    job: "president",
                    salary: 10000
                });
            } else {
                userJobs.job = "president";
                userJobs.salary = 10000;
            }

            await userJobs.save();
            return message.channel.send(
                "You now work as the president and earn 10,000 coins an hour! You can start working by using `=work`."
            );
        }
    }
});
