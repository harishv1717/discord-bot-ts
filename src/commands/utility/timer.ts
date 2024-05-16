import ms from "ms";
import { Util, MessageEmbed, MessageActionRow, MessageButton, Message } from "discord.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "timer",
    description: "Starts a timer.",
    permissions: "MANAGE_MESSAGES",
    usage: "<duration> <title>",
    async execute(_client: Client, message: Message, args: string[]) {
        if (!args.length) return message.reply(`You used this command wrong! Proper usage: \`${this.usage}\``);

        const time = ms(args[0]);
        if (!time) return message.reply("Invalid duration!");

        if (!args[1]) return message.reply(`You used this command wrong! Proper usage: \`${this.usage}\``);
        const title = args.slice(1).join(" ");

        const embed = new MessageEmbed()
            .setTitle(title)
            .setDescription(`Ends <t:${Math.trunc(Date.now() + time) / 1000}:R>`);
        const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId("timer-notify").setStyle("PRIMARY").setEmoji("⏰")
        );

        message.delete();
        const msg = await message.channel.send({ embeds: [embed], components: [row] });

        const users: string[] = [];

        const filter = () => true;
        const collector = msg.createMessageComponentCollector({ filter, max: 800000, time });

        collector.on("collect", interaction => {
            users.push(`<@${interaction.user.id}>`);
            interaction.reply({ content: `You will be pinged when the timer ends.`, ephemeral: true });
        });

        let ended = false;

        const interval: NodeJS.Timeout = setInterval(() => {
            if (ended) return clearInterval(interval);

            embed.setDescription(`Ends <t:${Math.trunc(Date.now() + time) / 1000}:R>`);
            msg.edit({ embeds: [embed], components: [row] });
        }, 10000);

        setTimeout(() => {
            ended = true;

            embed.setColor("#ff0000");
            embed.setDescription("TIMER ENDED");

            msg.edit({ embeds: [embed], components: [] });

            if (users.length) {
                const splits: string[] = Util.splitMessage(users.join(" "), { char: " " });
                for (const split of splits) message.channel.send(split).then(m => m.delete());
            }

            message.channel.send(`The timer for "${title}" has ended. ${msg.url}`);
        }, time);
    }
});
