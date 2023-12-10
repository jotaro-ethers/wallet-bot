import { Context } from "telegraf";
import { importWallet } from "./helpers/utilsdata";

let state:string;
export function setState(newState:string) {
    state = newState;
}

export function handleMessage(){
  return async (ctx: Context, next: () => Promise<void>) => {
    if (state == "importWallet") {
      let MnemonicOrAddress = "";
      if ("text" in ctx.message!) {
        MnemonicOrAddress = ctx.message.text;
      }
      const {message, err} = await importWallet(MnemonicOrAddress, ctx.from?.id, ctx.from?.username);
      if (err == null){
        ctx.reply(message);
        state = "\0";
      }
      else{
        ctx.reply(err.message);
      }
    } 
    else {
      next();
    }
  };
};
