/* eslint-disable @typescript-eslint/no-explicit-any */
import Client from "../../structs/client.js";

import { User, Message, version } from "discord.js";
import ms from "parse-ms";

import Command from "../../structs/command.js";
import MessageEmbed from "../../structs/embed.js";

import os from "os";

export default new Command({
    name: "stats",
    description: "stats",
    async execute(client: Client, message: Message) {
        if (!client.application?.owner) await client.application?.fetch();

        const { days, hours, minutes, seconds } = ms(client.uptime as number);
        const userCount = message.guild?.memberCount;

        const embedStats = new MessageEmbed(message.author)
            .setTitle("*** Stats ***")
            .setFooter(`Bot dev: ${(client.application?.owner as User).tag}`)
            .addField(
                "• Memory Usage",
                `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(
                    2
                )} MB`,
                true
            )
            .addField("• Uptime ", `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`, true)
            .addField("• Users", `${userCount}`, true)
            .addField("• Channels ", `${client.channels.cache.size}`, true)
            .addField("• Discord.js", `v${version}`, true)
            .addField("• Node.js", `${process.version}`, true)
            .addField("• CPU", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``)
            .addField("• Platform", `\`\`${os.platform()}\`\``, true);

        message.channel.send({ embeds: [embedStats] });
    }
});
