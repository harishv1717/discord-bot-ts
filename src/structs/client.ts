/* eslint-disable @typescript-eslint/no-explicit-any */
import Discord, {
    Collection,
    Role,
    Intents,
    Interaction,
    GuildMemberRoleManager,
    Snowflake,
    Message,
    Options,
    PartialTypes
} from "discord.js";

import loadDirs from "../utils/loadDirs.js";
import config, { Config } from "../config.js";

import dbModels from "../db/dbModels.js";
const [Cooldowns, Currency, Donations, Jobs, Tickets] = dbModels;

import Command, { SlashCommand } from "./command.js";
import { ClientProperties } from "../interfaces/clientInterface.js";

const partials: PartialTypes[] = ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"];

const intents = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGES
];

const makeCache = Options.cacheWithLimits({
    PresenceManager: 0,
    GuildMemberManager: 1000,
    UserManager: 1000,
    ReactionManager: 0,
    ReactionUserManager: 0,
    MessageManager: 200,
    BaseGuildEmojiManager: 0,
    GuildBanManager: 0,
    VoiceStateManager: 0,
    GuildInviteManager: 0,
    GuildStickerManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    StageInstanceManager: 0,
    ApplicationCommandManager: 1000
});

export default class Client extends Discord.Client implements ClientProperties {
    commands: Collection<string, Command>;
    slashCommands: Collection<string, SlashCommand>;

    cooldowns: Collection<string, Collection<Snowflake, number>>;

    botCount: number;
    config: Config;

    Cooldowns: any;
    Currency: any;
    Jobs: any;
    Tickets: any;

    constructor() {
        super({ intents, partials, makeCache });

        this.commands = new Collection();
        this.slashCommands = new Collection();

        this.cooldowns = new Collection();

        this.botCount = 24;
        this.config = config;

        this.Cooldowns = Cooldowns;
        this.Currency = Currency;
        this.Jobs = Jobs;
        this.Tickets = Tickets;
    }

    randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async loadDirs(): Promise<void> {
        await loadDirs.loadEvents(this);
        await loadDirs.loadCommands(this);
    }
}
