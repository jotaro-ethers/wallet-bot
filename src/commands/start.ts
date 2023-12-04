import { Context } from 'telegraf';

const start = async function start(ctx: Context) {
  const userId = ctx.message?.from.id;
  console.log(ctx.message);
  const userName = ctx.message?.from.username;
  ctx.reply(`Hello ${userName}! Your user ID is ${userId}. Welcome to the bot!`);
}
export {start};
