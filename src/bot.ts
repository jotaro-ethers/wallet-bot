import { Markup, Telegraf, session } from "telegraf";

import { start } from "./commands/start";
import { Config } from "./config/config";
import * as Wallet from "./commands/wallet";
import { connectToDatabase } from "./database/database";
import * as Utils from "./helpers/utils";
import * as Utilsdata from "./helpers/utilsdata";
import { handleMessage, setState } from "./handlemessage";
import { TransferBotHelper } from "./helpers/transferBot";

const bot = new Telegraf(Config.TELEGRAM_TOKEN);
console.log("Bot is starting");

const EventEmitter = require("events");
EventEmitter.defaultMaxListeners = 100;
connectToDatabase()
  .then(() => {})
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

bot.command("start", start);

bot.command("wallet", Wallet.wallet);

bot.action("buttonLink", async (ctx) => {
  await ctx.answerCbQuery();
  const buttonCreate = Markup.button.callback(
    "Create new wallet",
    "buttonCreate"
  );
  const buttonImport = Markup.button.callback("Import wallet", "buttonImport");
  ctx.reply(
    "Start your crypto journey with a new wallet or import an existing one",
    Markup.inlineKeyboard([buttonCreate, buttonImport])
  );
});

bot.action("buttonCreate", async (ctx) => {
  await ctx.answerCbQuery();
  const walletInfo: Utils.WalletInfo = Utils.generateWalletInfo();
  ctx.reply(
    `Your wallet address: ${walletInfo.address}\nYour private key: ${walletInfo.privateKey}\nYour mnemonic: ${walletInfo.mnemonic}`
  );
  await Utilsdata.saveWalletInfo(ctx.from?.id, ctx.from?.username, walletInfo);
});

bot.action(/\wallet\/del\/*/, async (ctx) => {
  await ctx.answerCbQuery();
  Wallet.Delwallet(ctx);
});

bot.action(/\wallet\/\/*/, async (ctx) => {
  await ctx.answerCbQuery();
  Wallet.trackWallet(ctx);
});

bot.action("buttonImport", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply("import walletaddress or mnemonic: ");
  setState("importWallet");
});

// bot transfer
const transferBotHelper: TransferBotHelper = new TransferBotHelper(bot);
transferBotHelper.sendTransferOptions();

// handle message other
bot.use(handleMessage());

// run bot
bot
  .launch()
  .then(() => {
    console.log("Bot is running");
  })
  .catch((err) => {
    console.error("Error starting bot:", err);
  });
