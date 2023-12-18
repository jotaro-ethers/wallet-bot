import { Markup, Telegraf, Context } from "telegraf";
import { userModel } from "../database/models/user";

interface InfTransfer {
  fromAdd: string;
  toAdd: string;
  amount: string;
  tokenAddr: string;
  type: string;
}

interface Action {
  messageId: number;
  title: string;
  menu: any;
  titleInput: string;
}

class TransferBotHelper {
  readonly #bot: Telegraf;

  #listAction: Action[] = [];

  #infoTransfer: InfTransfer = {
    fromAdd: "",
    toAdd: "",
    amount: "",
    tokenAddr: "",
    type: "",
  };

  constructor(bot: Telegraf) {
    this.#bot = bot;
  }

  // save action
  private performAction(action: Action): void {
    this.#listAction.push(action);
  }

  // get pre action
  private getPreviousAction(): Action {
    return (
      this.#listAction.pop() || {
        messageId: 0,
        title: "",
        menu: null,
        titleInput: "",
      }
    );
  }

  // get current action
  private getCurrentAction(): Action {
    return this.#listAction[this.#listAction.length - 1];
  }

  private createTypeTransferButtons(): Object[] {
    return [
      [
        Markup.button.callback("Transfer with user name", "userNameBtn"),
        Markup.button.callback("Transfer with address", "addBtn"),
      ],
      [
        Markup.button.callback("Transfer with OneID", "ondIdBtn"),
        Markup.button.callback("Cancel transfer", "cancelBtn"),
      ],
    ];
  }

  private createBtxBackAndCancel(): Object[] {
    return [
      Markup.button.callback("<< Back >>", "backBtx"),
      Markup.button.callback("<< Cancel transfer >>", "cancelBtn"),
    ];
  }

  private createConfirmTransfer(): Object[] {
    return [
      [Markup.button.callback("Sureeeeee", "sure")],
      this.createBtxBackAndCancel(),
    ];
  }

  private createTypeToken(): Object[] {
    return [
      [
        Markup.button.callback("Native", "nativeBtn"),
        Markup.button.callback("Token", "tokenBtn"),
        Markup.button.callback("Nft", "nftBtn"),
      ],
      this.createBtxBackAndCancel(),
    ];
  }

  private async createBtxAddressUser(ctx: Context): Promise<any> {
    const user = await userModel.findOne({ userId: ctx.from?.id }).lean();
    if (user && user.wallets && user.wallets.length > 0) {
      const buttons = [
        user.wallets.map((wallet: any) =>
          Markup.button.callback(wallet.address, `transfer-${wallet.address}`)
        ),
      ];
      buttons.push(this.createBtxBackAndCancel());
      return buttons;
    } else {
      console.log("User not found or no wallets available");
      return [];
    }
  }

  // create menu
  private async menu(
    title: string,
    menu: any,
    titleInput: string = "",
    ctx: Context
  ): Promise<void> {
    const message = await ctx.reply(title, Markup.inlineKeyboard(menu));

    this.performAction({
      messageId: message.message_id,
      title: title,
      menu: menu,
      titleInput: titleInput,
    });
    console.log(this.#listAction);
  }

  private handleUserNameBtn(): void {
    this.#bot.action("userNameBtn", async (ctx) => {
      await ctx.answerCbQuery();
      const currentAction = this.getCurrentAction();
      await ctx.deleteMessage(currentAction?.messageId);

      await this.menu(
        "Enter the address you want to transfer",
        this.createBtxBackAndCancel(),
        "InputAddress",
        ctx
      );
    });
  }

  private handleAddrBtn(): void {
    this.#bot.action("addBtn", async (ctx: Context) => {
      await ctx.answerCbQuery();
      const currentAction = this.getCurrentAction();
      await ctx.deleteMessage(currentAction?.messageId);

      await this.menu(
        "Enter the address you want to transfer",
        this.createBtxBackAndCancel(),
        "InputAddress",
        ctx
      );
    });
  }

  private handleMenuTypeToken(): void {
    this.#bot.action("nativeBtn", async (ctx: Context) => {
      await ctx.answerCbQuery();
      const currentAction = this.getCurrentAction();
      await ctx.deleteMessage(currentAction?.messageId);

      this.#infoTransfer.type = "native";

      this.menu(
        "Enter amount you want to transfer",
        this.createBtxBackAndCancel(),
        "InputAmount",
        ctx
      );
    });
  }

  private handleBtxAddressUser(): void {
    this.#bot.action(/transfer-\d+/, async (ctx) => {
      await ctx.answerCbQuery();

      const currentAction = this.getCurrentAction();
      await ctx.deleteMessage(currentAction?.messageId);

      const walletId = (ctx.callbackQuery as any)?.data.split("-")[1];
      await ctx.reply(`Wallet ID: ${walletId}`);

      this.#infoTransfer.toAdd === ""
        ? (this.#infoTransfer.toAdd = walletId)
        : (this.#infoTransfer.fromAdd = walletId);

      await this.menu(
        "You sure for transfer ?",
        this.createConfirmTransfer(),
        undefined,
        ctx
      );
    });
  }

  private handleInputText(): void {
    this.#bot.on("text", async (ctx) => {
      const userInput = ctx.message.text;

      if (userInput) {
        const currentAction = this.getCurrentAction();
        switch (currentAction.titleInput) {
          //todo
          case "InputUserName":
            await ctx.reply("HIHI");
            break;
          //todo
          case "InputAddress":
            this.#infoTransfer.toAdd = userInput;
            // delete message current
            await ctx.deleteMessage(currentAction?.messageId);
            await this.menu(
              "Please choose type token for transfer: ",
              this.createTypeToken(),
              undefined,
              ctx
            );
            break;
          //todo
          case "InputAmount":
            this.#infoTransfer.amount = userInput;
            // delete message current
            await ctx.deleteMessage(currentAction?.messageId);
            const button = await this.createBtxAddressUser(ctx);
            await this.menu(
              "Please choose address of your to transfer:",
              button,
              undefined,
              ctx
            );
          default:
            break;
        }
      }
    });
  }

  sendTransferOptions(): void {
    this.#bot.command("transfer", async (ctx) => {
      this.menu(
        "Please select a transfer type:",
        this.createTypeTransferButtons(),
        undefined,
        ctx
      );

      this.handleUserNameBtn();
      this.handleAddrBtn();
      this.handleInputText();
      this.handleMenuTypeToken();
      this.handleBtxAddressUser();

      this.#bot.action("cancelBtn", async (ctx) => {
        await ctx.answerCbQuery();
        const currentAction = this.getPreviousAction();
        await ctx.deleteMessage(currentAction?.messageId);

        await ctx.reply("Cancel transfer success");

        this.#listAction = [];
      });

      this.#bot.action("backBtx", async (ctx) => {
        await ctx.answerCbQuery();

        const currentAction = this.getPreviousAction();
        // delete action current
        await ctx.deleteMessage(currentAction?.messageId);

        const preAction = this.getPreviousAction();
        await this.menu(
          preAction?.title,
          preAction?.menu,
          preAction?.titleInput,
          ctx
        );
      });

      this.#bot.action("sure", async (ctx) => {
        await ctx.answerCbQuery;

        const currentAction = this.getPreviousAction();
        await ctx.deleteMessage(currentAction?.messageId);
        this.#listAction = [];

        await ctx.reply("Wait for transfer");
      });
    });
  }
}

export { TransferBotHelper };
