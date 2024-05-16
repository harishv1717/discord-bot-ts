import Client from "../../structs/client.js";
import Command from "../../structs/command.js";

import { Message, ApplicationCommand, ApplicationCommandPermissionData } from "discord.js";

export default new Command({
    name: "setperms",
    description: "Sets slash command permissions.",
    devOnly: true,
    guildOnly: true,
    async execute(client: Client, message: Message) {
        if (!client.application?.owner) await client.application?.fetch();

        const permissionCommands = client.slashCommands.filter(command => !!command.permissions);
        if (permissionCommands.size) {
            const fullPermissions = permissionCommands.map(command => {
                console.log(message.guild?.commands.cache);
                const { id } = message.guild?.commands.cache.find(
                    c => c.name === command.data.name
                ) as ApplicationCommand;
                const permissions = command.permissions as ApplicationCommandPermissionData[];

                return { id, permissions };
            });

            message.guild?.commands.permissions.set({ fullPermissions });
        }

        message.reply(`Successfully set permissions for all application (/) commands for ${message.guild?.name}`);
    }
});
