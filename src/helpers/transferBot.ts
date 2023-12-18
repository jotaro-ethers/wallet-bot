import { Markup, Telegraf, Context } from "telegraf";

class TransferBotHelper {
  readonly #bot: Telegraf;

  #messageId: number = 0;
  #preTitleMess: string = "";
  #preMenu: any = null;
  #titleInput: string = "";

  #fromAdd: string = "";
  #toAdd: string = "";

  constructor(bot: Telegraf) {
    this.#bot = bot;
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

      this.#titleInput = "InputUserName";

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
      this.#titleInput = "InputAddress";

      const message = await ctx.reply(newMessage, newButtons); // new buttons
      this.#messageId = message.message_id;
    });
  }

  private handleInputText(): void {
    this.#bot.on("text", async (ctx) => {
      const userInput = ctx.message.text;
      const chatId = ctx.chat?.id;
      console.log(userInput);
      console.log(this.#preTitleMess);
      if (userInput) {
        switch (this.#titleInput) {
          case "InputUserName":
            // todo: handle message for transfer address
            await ctx.reply("HIHI");
            break;
          case "InputAddress":
            // todo: handle message for transfer username
            await ctx.reply("HAHA");
            break;
          default:
            break;
        }
      }
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

      // handle input message
      this.handleInputText();

      // handle button cancel
      this.#bot.action("cancelBtn", async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.deleteMessage(this.#messageId); // destroy action other buttons
        await ctx.reply("Cancel transfer success");
        this.#preTitleMess = "";
        this.#preMenu = null;
      });

      // handle button back
      this.#bot.action("backBtx", async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.deleteMessage(this.#messageId); // destroy action current button

        // this.#preTitleMess = "";
        // this.#preMenu = null;

        // previous menu
        this.#messageId = (
          await ctx.reply(this.#preTitleMess, this.#preMenu)
        ).message_id;
      });
    });
  }
}

export { TransferBotHelper };
