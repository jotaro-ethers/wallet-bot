// bot/bot.js
import { Telegraf } from 'telegraf';
// const { start } = require('./commands/start');
import start from './commands/start';
// const { MONGODB_URI } = require('../config');
// const { connect } = require('../database');

// connect();
// const  Config = require('./config/config.js');
import {Config} from './config/config';
const bot = new Telegraf(Config.TELEGRAM_TOKEN);

// // Commands
// bot.command('start', start);

// // Add more commands and functionality as needed
// bot.launch().then(() => {
//     console.log('Bot is running');
//   }).catch((err) => {
//     console.error('Error starting bot:', err);
//   });
