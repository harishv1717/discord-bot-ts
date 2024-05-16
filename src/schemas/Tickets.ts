import mongoose from "mongoose";
import type, { Tickets } from "../interfaces/dbInterfaces.js";

export default new mongoose.Schema<Tickets>({
    _id: type(String),
    name: type(String),
    conversation: type(String),
    user: type(String),
    userid: type(String)
});
