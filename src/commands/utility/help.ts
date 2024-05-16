import fs from "fs";
import { Message, MessageActionRow, MessageSelectMenu, SelectMenuInteraction } from "discord.js";

import Client from "../../structs/client.js";
import MessageEmbed from "../../structs/embed.js";

import Command from "../../structs/command.js";

const toProperCase = (string: string) => {
    return string.toLowerCase().replace(/(\b\w)/gi, match => match.toUpperCase());
};

export default new Command({
    name: "help",
    description: "List all of the commands or info about a specific command.",
    aliases: ["commands"],
    usage: "[category or command]",
    async execute(client: Client, message: Message, args: string[]) {
        async function categoryHelpEmbed(category: string, interaction?: SelectMenuInteraction): Promise<void> {
            const categoryCommands = fs
                .readdirSync(`./dist/src/commands/${category}`)
                .map(command => command.split(".")[0])
                .filter(c => !client.commands.get(c)?.devOnly);

            const cmdList = categoryCommands.join("`, `");
            const categoryEmbed = new MessageEmbed(message.author)
                .setTitle(`${toProperCase(category)} Commands:`)
                .setDescription(`\`${cmdList}\``)
                .setThumbnail(message.guild?.iconURL({ dynamic: true }) as string)
                .setFooter(`You can do ${prefix}help <command> to get info on a specific command!`);

            const options = categoryCommands.map(c => {
                const command = client.commands.get(c) as Command;
                return { label: toProperCase(command.name), description: command.description, value: command.name };
            });

            const commandRow = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId("help-command")
                    .setPlaceholder("Select A Command")
                    .addOptions(options)
            );

            const msg = !interaction
                ? await message.channel.send({ embeds: [categoryEmbed], components: [commandRow] })
                : interaction.update({ embeds: [categoryEmbed], components: [commandRow] });

            const collector = (
                !interaction ? (msg as Message) : (interaction.message as Message)
            ).createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                max: 100,
                time: 120000
            });

            collector.on("collect", async (selection: SelectMenuInteraction) => {
                const command = selection.values[0];
                await commandHelpEmbed(selection, command);
                collector.stop();
            });
        }

        async function commandHelpEmbed(interaction?: SelectMenuInteraction, command?: string) {
            const cmd: Command = (
                !command
                    ? commands.get(args[0].toLowerCase()) ||
                      (commands.find(c => !!c.aliases?.includes(args[0].toLowerCase())) as Command)
                    : client.commands.get(command as string)
            ) as Command;

            const commandEmbed = new MessageEmbed(message.author)
                .setTitle(cmd.name)
                .setThumbnail(message.guild?.iconURL({ dynamic: true }) as string)
                .addField("Name:", cmd.name)
                .addField("Description:", cmd.description);
            if (cmd.aliases?.length)
                commandEmbed.addField("Aliases:", cmd.aliases.length == 1 ? cmd.aliases[0] : cmd.aliases.join(", "));
            if (cmd.usage) commandEmbed.addField("Usage:", prefix + cmd.name + " " + cmd.usage);
            if (cmd.permissions)
                commandEmbed.addField(
                    "Permissions:",
                    toProperCase(
                        typeof cmd.permissions === "string"
                            ? cmd.permissions.toLowerCase().replace(/_/g, " ").replace(/guild/g, "server")
                            : (cmd.permissions as string[])
                                  .join(",")
                                  .toLowerCase()
                                  .replace(/_/, " ")
                                  .replace(/guild/, "server")
                    )
                );
            if (cmd.cooldown) commandEmbed.addField("Cooldown:", cmd.cooldown + " seconds");

            !interaction
                ? message.channel.send({ embeds: [commandEmbed] })
                : interaction.update({ embeds: [commandEmbed] });

            const collector = (
                !interaction ? message : (interaction.message as Message)
            ).createMessageComponentCollector({ filter: i => i.user.id === message.author.id, max: 100, time: 120000 });

            collector.on("collect", async (selection: SelectMenuInteraction) => {
                const c = selection.values[0];
                await commandHelpEmbed(selection, c);
                collector.stop();
            });
        }

        async function mainHelpEmbed(): Promise<void> {
            const embeds = [
                new MessageEmbed(message.author)
                    .setTitle(`${client.config.serverName} Bot Help`)
                    .setDescription(
                        `This is a Discord Bot used in ${client.config.serverName}! You can use \`${prefix}help <category>\` or select an option from the menu below to see all of the commands in a specific category. You can also use \`${prefix}help <command>\` to get info on a specific command!`
                    )
                    .addField("Categories:", "`economy`, `fun`, `utility`, and `moderation`")
                    .addField(
                        "Server Help:",
                        "If you need help with anything related to this server or want to report somebody, just DM me!"
                    )
            ];

            const helpCategoryRow = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId("help-category")
                    .setPlaceholder("Select A Category")
                    .addOptions([
                        {
                            label: "Economy",
                            description: "Economy commands.",
                            value: "economy"
                        },
                        {
                            label: "Fun",
                            description: "Fun commands.",
                            value: "fun"
                        },
                        {
                            label: "Moderation",
                            description: "Moderation commands.",
                            value: "moderation"
                        },
                        {
                            label: "Utility",
                            description: "Utility commands.",
                            value: "utility"
                        }
                    ])
            );

            const sent = await message.channel.send({ embeds, components: [helpCategoryRow] });
            const collector = sent.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                max: 100,
                time: 120000
            });

            collector.on("collect", async (interaction: SelectMenuInteraction) => {
                const category = interaction.values[0];
                await categoryHelpEmbed(category, interaction);
                collector.stop();
            });
        }

        const {
            config: { prefix }
        } = client;

        const commands = client.commands.filter(command => !command.devOnly);
        const categories = fs.readdirSync("./dist/src/commands/");

        if (args[0]) {
            if (categories.some(category => category.toLowerCase() === args[0].toLowerCase())) {
                const category = args[0].toLowerCase();
                return categoryHelpEmbed(category);
            } else if (
                commands.some(
                    cmd =>
                        !!(
                            cmd.name.toLowerCase() === args[0].toLowerCase() ||
                            cmd.aliases?.includes(args[0].toLowerCase())
                        )
                )
            ) {
                commandHelpEmbed();
            } else mainHelpEmbed();
        } else mainHelpEmbed();
    }
});
