import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const DEFAULT_MONGO_URI = "mongodb+srv://sandhyaea23_db_user:oHls3nMsedqx8flZ@cluster0.o8vejtc.mongodb.net/portfolio?retryWrites=true&w=majority";

export const getMongoUri = () => {
    return process.env.MONGO_URI || DEFAULT_MONGO_URI;
};

export const ensureConnected = async () => {
    if (mongoose.connection.readyState === 1) return;
    try {
        await mongoose.connect(getMongoUri(), {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 10000
        });
        console.log(`MongoDB Connected successfully`);
    } catch (err) {
        console.error(`MongoDB Reconnection Error: ${err.message}`);
    }
};

const connectDB = async () => {
    try {
        const uri = getMongoUri();
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 10000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Initial Connection Error: ${error.message}`);
    }
};

export default connectDB;
