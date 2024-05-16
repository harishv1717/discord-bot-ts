import { Formatters, Message } from "discord.js";
import { inspect } from "util";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";
import MessageEmbed from "../../structs/embed.js";

export default new Command({
    name: "eval",
    description: "u don't need to know",
    usage: "<code>",
    devOnly: true,
    execute(_client: Client, message: Message, args: string[]): void {
        function clean(text: unknown) {
            if (typeof text === "string") {
                return text
                    .replace(/`/g, "`" + String.fromCharCode(8203))
                    .replace(/@/g, "@" + String.fromCharCode(8203));
            } else return text;
        }

        try {
            let code = args.join(" ");
            if (code.includes("await")) code = `(async () => {${code}})()`;

            const first = Date.now();
            const output = eval(code);
            const last = Date.now();

            let evaled = output;

            if (typeof evaled !== "string") evaled = inspect(evaled);

            const evaledEmbed = new MessageEmbed(message.author)
                .setTitle("Eval Result")
                .setColor("#00ff00")
                .addFields(
                    { name: "Input", value: Formatters.codeBlock("js", code) },
                    {
                        name: "Output:",
                        value: Formatters.codeBlock(`${clean(evaled)}`)
                    },
                    {
                        name: "Output Type:",
                        value: Formatters.codeBlock("js", output.constructor.name)
                    },
                    {
                        name: "Time Taken:",
                        value: `${last - first} ms`
                    }
                );
            message.channel.send({ embeds: [evaledEmbed] });
        } catch (err) {
            message.channel.send(`\`ERROR\` ${Formatters.codeBlock("xl", `${clean(err)}`)}`);
        }
    }
});
