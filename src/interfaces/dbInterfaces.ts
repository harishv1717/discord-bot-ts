import { Snowflake } from "discord.js";

export interface Cooldowns {
    _id: string;
    cooldown: Date;
}

export interface Currency {
    _id: Snowflake;
    bal: number;
    bank: number;
    bankSpace: number;
}

export interface Jobs {
    _id: Snowflake;
    job: string;
    salary: number;
}

export interface Tickets {
    _id: Snowflake;
    name: string;
    conversation: string;
    user: string;
    userid: string;
}

interface req {
    type: typeof String | typeof Number | typeof Date;
    required: boolean;
}

const type = (t: typeof String | typeof Number | typeof Date): req => {
    const reqObj: req = { type: t, required: true };
    return reqObj;
};

export default type;
