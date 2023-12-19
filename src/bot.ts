import { Context, Markup, Telegraf,session}from 'telegraf';
import {Config} from './config/config';
import Action from './commands/action';
import {start} from './commands/start';
import { connectToDatabase } from './database/database';
import * as Utils from './helpers/utils';
import * as Utilsdata from './helpers/utilsdata';
import {handleMessage,setState} from './handlemessage';
import * as Wallet from './commands/wallet';

console.log('Bot is starting');
const EventEmitter = require('events');

export const bot = new Telegraf(Config.TELEGRAM_TOKEN);

export const action = new Action(bot);


EventEmitter.defaultMaxListeners = 100;
connectToDatabase()
  .then(() => {
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
})

bot.command('start', start);

bot.command('wallet', Wallet.wallet);

bot.action('buttonLink', async (ctx) => {
  await ctx.answerCbQuery();
  const buttonCreate = Markup.button.callback('Create new wallet', 'buttonCreate');
  const buttonImport = Markup.button.callback('Import wallet', 'buttonImport');
  ctx.reply('Your chooise ?', Markup.inlineKeyboard([buttonCreate, buttonImport]));
});

bot.action('buttonCreate', async (ctx) => {
  await ctx.answerCbQuery();
  const walletInfo: Utils.WalletInfo = Utils.generateWalletInfo();
  ctx.replyWithHTML(`✅ Generated new wallet:\n Chain: Viction\n Wallet address: <pre>${walletInfo.address}</pre>\n Private key: <pre>${walletInfo.privateKey}</pre>\n Mnemonic: <pre>${walletInfo.mnemonic}</pre>\n <i>⚠️ Make sure to save this mnemonic phrase OR private key using pen and paper only. Do NOT copy-paste it anywhere. You could also import it to your Metamask/Trust Wallet. After you finish saving/importing the wallet credentials, delete this message. The bot will not display this information again.</i>`)
  await Utilsdata.saveWalletInfo(ctx.from?.id,ctx.from?.username, walletInfo);
});

bot.action(/\wallet\/del\/*/, async (ctx) => {
  await ctx.answerCbQuery();
  Wallet.Delwallet(ctx);
});

bot.action(/\wallet\/\/*/, async (ctx) => {
  await ctx.answerCbQuery();
  Wallet.trackWallet(ctx);
});

bot.action("buttonImport",async(ctx)=>{
  await ctx.answerCbQuery();
  const PrivatekeyOrMnemonic = Markup.button.callback("Private key or mnemonic", "PriOrMneButton");
  const WalletAddress = Markup.button.callback("View only", "WaddressButton");
  const option_1 = async (ctx:Context)=>{
    await ctx.answerCbQuery();
    ctx.reply("import private key or mnemonic: ");
    setState("importPriorMne");
  }

  const option_2 = async (ctx:Context)=>{
    await ctx.answerCbQuery();
    ctx.reply("import your wallet address: ");
    setState("walletAddress");
  }
  await action.setButton("PriOrMneButton", option_1);
  await action.setButton("WaddressButton", option_2);

  ctx.reply("You can choose your option: ", {
    reply_markup:{
      inline_keyboard:[[PrivatekeyOrMnemonic,WalletAddress]]
    }
  })
})
bot.use(handleMessage())

bot.launch().then(() => {
    console.log('Bot is running');
}).catch((err) => {
    console.error('Error starting bot:', err);
});
