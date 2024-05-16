import { GuildMember, Message } from "discord.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "ban",
    description: "Bans a member",
    usage: "<@user> [reason]",
    cooldown: 10,
    permissions: ["ADMINISTRATOR"],
    aliases: ["bon", "banish"],
    execute(_client: Client, message: Message, args: string[]): unknown {
        if (!message.mentions.users.size) {
            return message.channel.send("You didn't say who to ban");
        }

        const member: GuildMember = message.mentions.members?.first() as GuildMember;
        if (args[1]) {
            // eslint-disable-next-line no-empty-function, @typescript-eslint/no-empty-function
            member.user.send(`You were banned for: ${args.join(" ")}`).catch(() => {});
        }

        member.ban().catch((error: Error) => {
            console.error(error);
            message.channel.send(`There was an error banning ${member.user.username}`);
        });
    }
});
