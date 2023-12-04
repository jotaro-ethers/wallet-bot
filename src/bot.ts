import { Telegraf } from 'telegraf';
import {start} from './commands/start';
import {Config} from './config/config';
const bot = new Telegraf(Config.TELEGRAM_TOKEN);

bot.command('start', start);
bot.launch().then(() => {
    console.log('Bot is running');
  }).catch((err) => {
    console.error('Error starting bot:', err);
  });
