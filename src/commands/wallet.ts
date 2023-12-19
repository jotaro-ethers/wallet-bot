import { Context } from "telegraf";
import { Markup } from "telegraf";
import { userModel } from "../database/models/user";
import * as utilsdata from "../helpers/utilsdata";
import * as utils from "../helpers/utils";
import * as path from "path";
import dayjs from "dayjs";
import "dayjs/locale/en";
import {action} from "../bot"

const assetsFolderPath = path.join(__dirname, "..", "assets");
let tr = 1;
export async function wallet(ctx: Context) {
  const buttonLink = Markup.button.callback("Link wallet", "buttonLink");
  var ButtonsWallets = [[buttonLink]];
  const user = await userModel.findOne({ userId: ctx.from?.id });
  if (user) {
    for (var i = 0; i < user.wallets.length; i++) {
      var walletButton = [
        Markup.button.callback(
          user.wallets[i].address,
          "wallet/" + user.wallets[i].address
        ),
        Markup.button.callback("❌", "wallet/del/" + user.wallets[i].address),
      ];
      ButtonsWallets.push(walletButton);
    }
    ctx.reply(
      "Your wallet list here, select the wallet you want to use or link a new one!",
      Markup.inlineKeyboard(ButtonsWallets)
    );
  } else {
    ctx.reply(
      "Your wallet list, select the wallet you want to use or link a new one!",
      Markup.inlineKeyboard(ButtonsWallets)
    );
    console.log("User not found");
  }
}

export async function Delwallet(ctx: Context) {
  
  const data = (ctx.callbackQuery as any)?.data;
  const confirmButton = Markup.button.callback("Confirm","confirmButton" + data)
  const delineButton = Markup.button.callback("Deny","cancelButton"+ data)
  
  console.log(data);
  if (data) {
    const prefix = "wallet/del/";
    const extractedData = data.substring(prefix.length);
    const userId = ctx.from?.id;

    const denybuttonCallBack = async (ctx:Context)=>{
      await ctx.answerCbQuery();
      wallet(ctx);
    }

    const agreebuttonCallBack = async(ctx:Context)=>{
      await ctx.answerCbQuery();
     
      utilsdata.deleteWallet(userId, extractedData);
      ctx.reply("Deleted wallet: " + extractedData);
    }

    await ctx.reply("Do you really want to delete it ?",{
      reply_markup:{
        inline_keyboard:[[confirmButton, delineButton]]
      }
    })

    await action.setButton("confirmButton" + data, agreebuttonCallBack);
    await action.setButton("cancelButton" + data, denybuttonCallBack);

  } else {
    console.error("Callback query is undefined");
  }
}

export async function trackWallet(ctx: Context) {
  const data = (ctx.callbackQuery as any)?.data;
  if (data) {
    const time = dayjs().locale(`${ctx.from?.language_code}}`);
    const timeFormatted = time.format("YYYY-MM-DD HH:mm:ss");
    const prefix = "wallet/";
    const extractedData = data.substring(prefix.length);
    var loadingMessage = await ctx.replyWithHTML("Loading...");
    const { tokens, totalRemain } = await utils.trackWallet(extractedData);
    const tokensJson = JSON.parse(JSON.stringify(tokens));
    var htmlText = `<pre>Address: ${extractedData}\n---------------------------------------------------\n`;
    for (const token of tokensJson) {
      htmlText += `${token.name} ($${token.symbol}) : ${token.balance} | USD : ${token.remain} \n📈 Price: ${token.price}`;
      if ((token.priceChangePercentage as number) > 0) {
        htmlText += ` 🟢 ${token.priceChange} | +${token.priceChangePercentage}%\n`;
      } else {
        htmlText += ` 🔴 ${token.priceChange} | ${token.priceChangePercentage}%\n`;
      }
    }
    htmlText += `💰Total Balance: ${totalRemain} USD</pre>\n`;
    htmlText += `<i>⌚️-------${timeFormatted}-------⌚️\n ℹ️ The bot only displays the top tokens that have been verified by Vicscan </i>\n📢 VictelPay - Advertise with us @jotaro_ne\n🔎 View your wallet on explorer <a href="https://vicscan.xyz/address/${extractedData}">👇</a>\n`;

    await ctx.telegram.editMessageText(
      ctx.chat?.id,
      loadingMessage.message_id,
      undefined,
      htmlText,
      { parse_mode: "HTML" }
    );
  } else {
    console.error("Callback query is undefined");
  }
}
