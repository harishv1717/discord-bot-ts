import mongoose from "mongoose";
import type, { Cooldowns } from "../interfaces/dbInterfaces.js";

export default new mongoose.Schema<Cooldowns>({
    _id: type(String),
    cooldown: type(Date)
});
