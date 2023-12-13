import { Markup, Telegraf } from "telegraf";

class TransferBotHelper {
  #bot: Telegraf;

  constructor(bot: any) {
    this.#bot = bot;
  }

  createTransferButtons(): any {
    return Markup.inlineKeyboard([
      Markup.button.callback("Transfer Native Token", "transferNative"),
      Markup.button.callback("Transfer Token", "transferToken"),
    ]);
  }

  sendTransferOptions(): void {
    this.#bot.command("transfer", async (ctx) => {
      await ctx.reply(
        "Please select a transfer type:",
        this.createTransferButtons()
      );
    });

    this.#bot.action("transferNative", async (ctx) => {
      await ctx.answerCbQuery();
    });
  }
}

export { TransferBotHelper };
