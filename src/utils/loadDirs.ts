import fs from "fs";

import Client from "../structs/client.js";
import Command, { SlashCommand } from "../structs/command.js";

export default {
    async loadEvents(client: Client): Promise<void> {
        console.log("\n LOADING EVENTS\n----------------");

        const files: string[] = fs.readdirSync("./dist/src/events/");
        for (const file of files) {
            const event = (await import(`../events/${file.replace(".ts", ".js")}`)).default;

            const name: string = file.split(".")[0];
            client.on(name, event.bind(null, client));

            console.log(`Loaded ${name} event.`);
        }

        console.log();
    },

    async loadCommands(client: Client): Promise<void> {
        console.log(" LOADING COMMANDS\n------------------");

        const folders: string[] = fs.readdirSync("./dist/src/commands/");
        for (const folder of folders) {
            const files: string[] = fs.readdirSync(`./dist/src/commands/${folder}/`);
            for (const file of files) {
                const command: Command = (await import(`../commands/${folder}/${file.replace(".ts", ".js")}`)).default;
                client.commands.set(command.name, command);

                console.log(`Loaded ${command.name} command.`);
            }

            console.log();
        }

        console.log(" LOADING SLASH COMMANDS\n------------------");

        const slashCmdFiles = fs.readdirSync("./dist/src/slashCommands/");
        for (const file of slashCmdFiles) {
            const command: SlashCommand = (await import(`../slashCommands/${file.replace(".ts", ".js")}`)).default;
            client.slashCommands.set(command.data.name, command);

            console.log(`Loaded ${command.data.name} command.`);
        }

        console.log();
    }
};
