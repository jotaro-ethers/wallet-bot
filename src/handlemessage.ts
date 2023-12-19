import { Context, Markup } from "telegraf";
import { ImportWalletAddress, importWallet } from "./helpers/utilsdata";
import { createTextChangeRange } from "typescript";
import { wallet } from "./commands/wallet";
import {action,bot} from "./bot"

let state:string;
export function setState(newState:string) {
    state = newState;
}

export function handleMessage(){
  return async (ctx: Context, next: () => Promise<void>) => {

    const agreeButton = Markup.button.callback("Yes","agreeButton")
    const delineButton = Markup.button.callback("Deny","denyButton")
    try {
      if (state == "importPriorMne") {
        let MnemonicOrAddress = "";
        
        if ("text" in ctx.message!) {
          MnemonicOrAddress = ctx.message.text;
        }

        const {message, err} = await importWallet(MnemonicOrAddress, ctx.from?.id, ctx.from?.username);
        if (err == null){
          // ctx.reply(message );
          ctx.telegram.sendAnimation((await ctx.getChat()).id, "https://cdn.dribbble.com/users/11783/screenshots/3492735/animation.gif");
          state = "\0";
        }
        else{
          const denybuttonCallBack = async (ctx:Context)=>{
            await ctx.answerCbQuery();
            setState("\0");
            await wallet(ctx);
          }
          
          const agreebuttonCallBack = async(ctx:Context)=>{
            await ctx.answerCbQuery();
            ctx.reply("import private key or mnemonic: ")
            setState("importPriorMne")
          }
  
          state = "\0";
          await ctx.reply(err.message)
          await ctx.reply("Would you like to enter again ?", {
            reply_markup:{
              inline_keyboard:[[agreeButton, delineButton]]
            },
          });
          await action.setButton("agreeButton", agreebuttonCallBack)
          await action.setButton("denyButton", denybuttonCallBack)
        }
      } 
      else if (state == "walletAddress"){
        let WalletAddress = "";
        
        if ("text" in ctx.message!) {
          WalletAddress = ctx.message.text;
        }
        const {message, err} = await ImportWalletAddress(WalletAddress, ctx.from?.id, ctx.from?.username);
        if (err == null){
          ctx.telegram.sendAnimation((await ctx.getChat()).id, "https://cdn.dribbble.com/users/11783/screenshots/3492735/animation.gif");
          state = "\0";
        }else{
          const denybuttonCallBack = async (ctx:Context)=>{
            await ctx.answerCbQuery();
            setState("\0");
            await wallet(ctx);
          }
          
          const agreebuttonCallBack = async(ctx:Context)=>{
            await ctx.answerCbQuery();
            ctx.reply("import your wallet address: ")
            setState("walletAddress")
          }
  
          state = "\0";
          await ctx.reply(err.message)
          await ctx.reply("Would you like to enter again ?", {
            reply_markup:{
              inline_keyboard:[[agreeButton, delineButton]]
            },
          });
          await action.setButton("agreeButton", agreebuttonCallBack)
          await action.setButton("denyButton", denybuttonCallBack)
        }
      }
      else {
        next();
      }  
    } catch (error) {
      
    }
    
  };
};