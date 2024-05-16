import { User, Message } from "discord.js";

import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

export default new Command({
    name: "avatar",
    description: "Shows the user's pfp.",
    aliases: ["av", "icon", "pfp", "profilepicture", "profilepic"],
    usage: "[users]",
    execute(_client: Client, message: Message): unknown {
        if (!message.mentions.users.size) {
            return message.channel.send(`Your avatar: ${message.author.displayAvatarURL({ dynamic: true })}`);
        }

        const avatarList: string[] = message.mentions.users.map((user: User) => {
            return `${user.username}'s avatar: ${user.displayAvatarURL({
                dynamic: true
            })}`;
        });

        message.channel.send(avatarList.join("\n"));
    }
});
