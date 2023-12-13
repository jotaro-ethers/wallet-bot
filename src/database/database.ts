import mongoose from "mongoose";
import { Config } from "../config/config";

export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(Config.MONGODB_URI, {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
