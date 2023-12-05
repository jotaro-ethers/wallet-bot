import { Context, Markup, Telegraf } from 'telegraf';
import {start} from './commands/start';
import {Config} from './config/config';
import * as Wallet from './commands/wallet';
import { connectToDatabase } from './database/database';
import * as Utils from './helpers/utils';
import * as Utilsdata from './helpers/utilsdata';

const bot = new Telegraf(Config.TELEGRAM_TOKEN);

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
  ctx.reply('Wallet Menu:', Markup.inlineKeyboard([buttonCreate, buttonImport]));
});

bot.action('buttonCreate', async (ctx) => {
  await ctx.answerCbQuery();
  const walletInfo: Utils.WalletInfo = Utils.generateWalletInfo();
  ctx.reply(`Your wallet address: ${walletInfo.address}\nYour private key: ${walletInfo.privateKey}\nYour mnemonic: ${walletInfo.mnemonic}`);
  await Utilsdata.saveWalletInfo(ctx.from?.id,ctx.from?.username, walletInfo);


});

bot.launch().then(() => {
    console.log('Bot is running');
  }).catch((err) => {
    console.error('Error starting bot:', err);
  });