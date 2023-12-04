import { Telegraf } from 'telegraf';
import {start} from './commands/start';
import {Config} from './config/config';
import * as Wallet from './commands/wallet';
const bot = new Telegraf(Config.TELEGRAM_TOKEN);

bot.command('start', start);
bot.command('wallet', Wallet.wallet);
bot.action('wallet_button', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply('Button clicked!');
});
bot.launch().then(() => {
    console.log('Bot is running');
  }).catch((err) => {
    console.error('Error starting bot:', err);
  });
