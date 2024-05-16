import { APIApplicationCommandOption } from "discord-api-types/v9";

import {
    CommandInteraction,
    PermissionResolvable,
    Message,
    CommandInteractionOptionResolver,
    ContextMenuInteraction,
    ApplicationCommandPermissionData
} from "discord.js";
import { BaseCommandProperties, CommandProperties, SlashCommandProperties } from "../interfaces/commandInterfaces";

import Client from "./client";

class BaseCommand implements BaseCommandProperties {
    cooldown?: number;

    constructor(properties: BaseCommandProperties) {
        this.cooldown = properties.cooldown;
    }
}

export class SlashCommand extends BaseCommand implements SlashCommandProperties {
    data: {
        name: string;
        description: string;
        options?: APIApplicationCommandOption[];
        default_permission: boolean | undefined;
    };
    permissions?: ApplicationCommandPermissionData[];
    execute: (
        client: Client,
        interaction: CommandInteraction | ContextMenuInteraction,
        options: CommandInteractionOptionResolver
    ) => unknown;

    constructor(properties: SlashCommandProperties) {
        const { cooldown } = properties;
        super({ cooldown });

        this.data = properties.data;
        this.permissions = properties.permissions;
        this.execute = properties.execute;
    }
}

export default class Command extends BaseCommand implements CommandProperties {
    name: string;
    aliases: string[] | undefined;

    description: string;
    usage: string | undefined;

    guildOnly?: boolean | undefined;
    devOnly?: boolean | undefined;

    permissions: PermissionResolvable | undefined;
    cooldown: number | undefined;

    execute: (client: Client, message: Message, args: string[]) => unknown;

    constructor(properties: CommandProperties) {
        const { cooldown } = properties;
        super({ cooldown });

        this.name = properties.name;
        this.aliases = properties.aliases;

        this.description = properties.description;
        this.usage = properties.usage;

        this.devOnly = properties.devOnly;
        this.guildOnly = properties.guildOnly;

        this.permissions = properties.permissions;

        this.execute = properties.execute;
    }
}
