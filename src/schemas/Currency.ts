import mongoose from "mongoose";
import type, { Currency } from "../interfaces/dbInterfaces.js";

export default new mongoose.Schema<Currency>({
    _id: type(String),
    bal: type(Number),
    bank: type(Number),
    bankSpace: type(Number)
});
