import { Snowflake } from "discord.js";

export interface ConfigProperties {
    token: string;

    db: string;

    prefix: string;
    themeColor: string;

    serverName: string;
    website: string;
    serverIcon: string;
}

export interface IDsProperties {
    users: {
        owner: Snowflake;
    };
    roles: {
        admin: Snowflake;
    };
    channels: {
        admin: Snowflake;
        botCount: Snowflake;
    };
    guild: Snowflake;
    me: Snowflake;
}
