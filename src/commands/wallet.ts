import { Context } from 'telegraf';
import {Markup} from 'telegraf';

export async function wallet(ctx: Context) {
    const buttonLink = Markup.button.callback('Link wallet', 'buttonLink');
    var Buttons = [buttonLink];
    ctx.reply('Hello! Click the button below:', Markup.inlineKeyboard([buttonLink]));
    
}