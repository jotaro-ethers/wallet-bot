import { Markup, Telegraf,session}from 'telegraf';
 
import {start} from './commands/start';
import {Config} from './config/config';
import * as Wallet from './commands/wallet';
import { connectToDatabase } from './database/database';
import * as Utils from './helpers/utils';
import * as Utilsdata from './helpers/utilsdata';

const bot = new Telegraf(Config.TELEGRAM_TOKEN);

let state:string;

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
  const buttonGetBalance = Markup.button.callback('Get balance', 'getBalance');
  const button = Markup.button.callback('Get', 'get');
  ctx.reply('Wallet Menu:', Markup.inlineKeyboard([[buttonCreate, buttonImport],[buttonGetBalance, button]]));
});

bot.action('buttonCreate', async (ctx) => {
 
  await ctx.answerCbQuery();
  const walletInfo: Utils.WalletInfo = Utils.generateWalletInfo();
  ctx.reply(`Your wallet address: ${walletInfo.address}\nYour private key: ${walletInfo.privateKey}\nYour mnemonic: ${walletInfo.mnemonic}`);
  await Utilsdata.saveWalletInfo(ctx.from?.id,ctx.from?.username, walletInfo);
});



bot.action('getBalance', async (ctx)=>{
  state = "getBalance"
  await ctx.answerCbQuery();
  ctx.reply("please input the token address: ")
})

bot.action('get', async (ctx)=>{
  state = "get"
})

bot.use(async (ctx,next)=>{
  if( state == "getBalance"){
    const {balance, err} = await Utilsdata.getBalance(ctx);
    if (err instanceof Error && err.message != ""){
      ctx.reply(err.message)
      return
    }
    else{
      console.log(balance)
      ctx.reply(`your balance is ${balance}`)
    }
    state = "\0"
  }
  else{
    next()
  }
})

bot.launch().then(() => {
    console.log('Bot is running');
  }).catch((err) => {
    console.error('Error starting bot:', err);
  });