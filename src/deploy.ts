import fs from "fs";

import config from "./config.js";
const { token, ids } = config;
import { SlashCommand } from "./structs/command.js";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

const commands = [];
const commandFiles: string[] = fs.readdirSync("./dist/src/slashCommands/").filter(file => file.endsWith(".js"));

(async () => {
    for (const file of commandFiles) {
        const command: SlashCommand = (await import(`./slashCommands/${file.replace(".ts", ".js")}`)).default;
        commands.push(command.data);
    }

    const rest: REST = new REST({ version: "9" }).setToken(token);

    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationGuildCommands(ids.me, ids.guild) as unknown as `/${string}`, {
            body: commands
        });

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();
