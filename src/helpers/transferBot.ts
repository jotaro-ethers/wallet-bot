import { Markup, Telegraf, Context } from "telegraf";

class TransferBotHelper {
  readonly #bot: Telegraf;
  #messageId: number;
  #preTitleMess: string;
  #preMenu: any;

  constructor(bot: Telegraf) {
    this.#bot = bot;
    this.#messageId = 0;
    this.#preTitleMess = "";
    this.#preMenu = null;
  }

  private createTypeTransferButtons(): any {
    // create buttons
    return Markup.inlineKeyboard([
      [
        Markup.button.callback("Transfer with user name", "userNameBtn"),
        Markup.button.callback("Transfer with address", "addBtn"),
      ],
      [
        Markup.button.callback("Transfer with OneID", "ondIdBtn"),
        Markup.button.callback("Cancel transfer", "cancelBtn"),
      ],
    ]);
  }

  private handleUserNameBtn(): void {
    this.#bot.action("userNameBtn", async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.deleteMessage(this.#messageId); // destroy action other buttons

      // save menu
      this.#preTitleMess = "Please select a transfer type:";
      this.#preMenu = this.createTypeTransferButtons();

      const newMessage = "Enter the telegram user name you want to transfer";
      const newButtons = Markup.inlineKeyboard([
        Markup.button.callback("<< Back to list type transfer", "backBtx"),
        Markup.button.callback("Cancel transfer", "cancelBtn"),
      ]);

      const message = await ctx.reply(newMessage, newButtons); // new buttons
      this.#messageId = message.message_id;
    });
  }

  private handleAddBtn(): void {
    this.#bot.action("addBtn", async (ctx: Context) => {
      await ctx.answerCbQuery();
      await ctx.deleteMessage(this.#messageId); // destroy action other buttons

      // save menu
      this.#preTitleMess = "Please select a transfer type:";
      this.#preMenu = this.createTypeTransferButtons();

      const newMessage = "Enter the address you want to transfer";
      const newButtons = Markup.inlineKeyboard([
        Markup.button.callback("<< Back to list type transfer", "backBtx"),
        Markup.button.callback("Cancel transfer", "cancelBtn"),
      ]);

      const message = await ctx.reply(newMessage, newButtons); // new buttons
      this.#messageId = message.message_id;

      this.#bot.on("text", (ctx) => {
        const userInput = ctx.message.text;
        const chatId = ctx.chat?.id;

        console.log(ctx.message.text);
      });
    });
  }

  sendTransferOptions(): void {
    this.#bot.command("transfer", async (ctx) => {
      const message = await ctx.reply(
        "Please select a transfer type:",
        this.createTypeTransferButtons()
      );

      this.#messageId = message.message_id;
      this.handleUserNameBtn();
      this.handleAddBtn();

      // handle button cancel
      this.#bot.action("cancelBtn", async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.deleteMessage(this.#messageId); // destroy action other buttons
        await ctx.reply("Cancel transfer success");
      });

      // handle button back
      this.#bot.action("backBtx", async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.deleteMessage(this.#messageId); // destroy action current button

        // previous menu
        this.#messageId = (
          await ctx.reply(this.#preTitleMess, this.#preMenu)
        ).message_id;
      });
    });
  }
}

export { TransferBotHelper };
