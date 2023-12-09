import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import { userModel } from '../database/models/user';
import * as utilsdata from '../helpers/utilsdata';
import * as utils from '../helpers/utils';
import * as path from 'path';
const assetsFolderPath = path.join(__dirname, '..', 'assets');
export async function wallet(ctx: Context) {
    if(!utils.timeout(ctx.message?.date as number)){    
    const buttonLink = Markup.button.callback('Link wallet', 'buttonLink');
    var ButtonsWallets = [[buttonLink]];
    const user = await userModel.findOne({ userId: ctx.from?.id });
        if (user) {
            for (var i = 0; i < user.wallets.length; i++) {
                var walletButton = [
                    Markup.button.callback(user.wallets[i].address, 'wallet/' + user.wallets[i].address),
                    Markup.button.callback('❌','wallet/del/' + user.wallets[i].address)
                ];
                ButtonsWallets.push(walletButton);

            }
            ctx.reply('Hello! Click the button below:', Markup.inlineKeyboard(ButtonsWallets));
        } else {
            ctx.reply('Hello! Click the button below:', Markup.inlineKeyboard(ButtonsWallets));
            console.log("User not found");
        }
    }
}


export async function Delwallet(ctx: Context){
    const data = (ctx.callbackQuery as any)?.data;
    console.log(data)
    if (data){
        const prefix = 'wallet/del/'
        const extractedData = data.substring(prefix.length);
        const userId = ctx.from?.id;
        utilsdata.deleteWallet(userId,extractedData);
        ctx.reply('Deleted wallet: ' + extractedData);

    }else {
    console.error('Callback query is undefined');
  }
}

export async function trackWallet(ctx: Context){
    const data = (ctx.callbackQuery as any)?.data;
    console.log(data)
    if (data){
        const prefix = 'wallet/'
        const extractedData = data.substring(prefix.length);
        var loadingMessage = await ctx.reply('Loading...');


        const {tokens, totalRemain} = await utils.trackWallet(extractedData);
        const tokenString = JSON.stringify(tokens);
        await ctx.telegram.editMessageText(
            ctx.chat?.id,
            loadingMessage.message_id,
            undefined,
            tokenString);
        
        
    }else {
    console.error('Callback query is undefined');
  }
}