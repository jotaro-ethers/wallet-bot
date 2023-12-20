// config.ts
import dotenv from "dotenv";

dotenv.config();

export const Config = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || "your_telegram_bot_token",
  MONGODB_URI: process.env.MONGODB_URI || "your_mongodb_connection_string",
  RPC_TOMO: process.env.RPC_TOMO,
  RPC_HTTP: process.env.RPC_HTTP || "https://rpc.testnet.tomochain.com",
};
