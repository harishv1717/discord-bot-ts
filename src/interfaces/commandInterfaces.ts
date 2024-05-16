import { APIApplicationCommandOption } from "discord-api-types/v9";

import {
    PermissionResolvable,
    CommandInteraction,
    Message,
    CommandInteractionOptionResolver,
    ContextMenuInteraction,
    ApplicationCommandPermissionData
} from "discord.js";

import Client from "../structs/client.js";

export interface BaseCommandProperties {
    cooldown?: number;
}

export interface SlashCommandProperties extends BaseCommandProperties {
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
}

export interface CommandProperties extends BaseCommandProperties {
    name: string;
    description: string;
    usage?: string;
    aliases?: string[];
    devOnly?: boolean | undefined;
    guildOnly?: boolean | undefined;
    permissions?: PermissionResolvable;
    execute(client: Client, message: Message, args: string[]): unknown;
}
