import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from backend folder or root
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("Warning: MONGO_URI is not defined in .env file");
            return;
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
    }
};

export default connectDB;
