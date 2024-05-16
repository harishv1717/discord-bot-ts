import mongoose from "mongoose";
import type, { Jobs } from "../interfaces/dbInterfaces.js";

export default new mongoose.Schema<Jobs>({
    _id: type(String),
    job: type(String),
    salary: type(Number)
});
