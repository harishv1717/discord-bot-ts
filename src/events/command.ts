import { Collection, Message, Snowflake, TextChannel } from "discord.js";

import Client from "../structs/client";
import Command from "../structs/command";

export default async (client: Client, message: Message): Promise<unknown> => {
    const { prefix, ids } = client.config;
    const { cooldowns } = client;

    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === "DM") return;

    const args: string[] = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName: string | undefined = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command: Command =
        (client.commands.get(commandName) as Command) ||
        (client.commands.find((cmd: Command) => !!cmd.aliases?.includes(commandName)) as Command);

    if (!command) return;

    if (command.permissions) {
        const authorPerms = (message.channel as TextChannel).permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) return message.reply("You can not do message!");
    }

    if (command.devOnly && message.author.id !== ids.users.owner) return;

    if (!cooldowns.has(command.name as string)) cooldowns.set(command.name as string, new Collection());

    const now: number = Date.now();

    const timestamps = cooldowns.get(command.name as string) as Collection<Snowflake, number>;
    const cooldownAmount: number = (command.cooldown as number) * 1000;

    if (timestamps?.has(message.author.id)) {
        const expirationTime: number = (timestamps.get(message.author.id) as number) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft: number = (expirationTime - now) / 1000;
            return message.reply(
                `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
            );
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        await command.execute(client, message, args);
    } catch (error) {
        console.error(error);
        message.reply("There was an error trying to execute this command!");
    }
};
