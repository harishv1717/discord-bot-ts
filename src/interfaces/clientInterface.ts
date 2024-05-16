/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model } from "mongoose";
import { Collection, Message, Interaction, Snowflake } from "discord.js";

import Command, { SlashCommand } from "../structs/command";
import { Config } from "../config";

export interface ClientProperties {
    commands: Collection<string, Command>;
    slashCommands: Collection<string, SlashCommand>;

    cooldowns: Collection<string, Collection<Snowflake, number>>;

    botCount: number;
    config: Config;

    Cooldowns: Model<any, any, any>;
    Currency: Model<any, any, any>;
    Jobs: Model<any, any, any>;

    randomInt(min: number, max: number): number;
    loadDirs(): Promise<void>;
}
