import mongoose, { Mongoose } from "mongoose";
import config from "../config.js";

export default async (): Promise<Mongoose> => {
    await mongoose.connect(config.db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    return mongoose;
};
