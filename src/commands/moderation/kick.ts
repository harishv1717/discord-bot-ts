import { GuildMember, Message } from "discord.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "kick",
    description: "kicks pinged user",
    usage: "<@user> [reason]",
    cooldown: 10,
    permissions: ["ADMINISTRATOR"],
    aliases: ["boot"],
    execute(_client: Client, message: Message, args: string[]): unknown {
        if (!message.mentions.users.size) {
            return message.channel.send("You didn't say who to kick");
        }

        const member: GuildMember = message.mentions.members?.first() as GuildMember;
        if (args[1]) {
            // eslint-disable-next-line no-empty-function, @typescript-eslint/no-empty-function
            member.user.send(`You were kicked for: ${args.join(" ")}`).catch(() => {});
        }

        member.kick().catch((error: Error) => {
            console.error(error);
            message.channel.send(`There was an error kicking ${member.user.username}`);
        });
    }
});
