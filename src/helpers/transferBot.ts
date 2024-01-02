import { Markup, Telegraf, Context } from "telegraf";
import { userModel } from "../database/models/user";
import { TransferWalletUtil } from "../utils/transferWallet";
import { assert } from "console";

const transferWalletUtil = new TransferWalletUtil();

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

  private createBtnBackAndCancel(): Object[] {
    return [
      Markup.button.callback("<< Back >>", "backBtn"),
      Markup.button.callback("<< Cancel transfer >>", "cancelBtn"),
    ];
  }

  private createConfirmTransfer(): Object[] {
    return [
      [Markup.button.callback("Sure", "sure")],
      this.createBtnBackAndCancel(),
    ];
  }

  private createTypeToken(): Object[] {
    return [
      [
        Markup.button.callback("Native", "nativeBtn"),
        Markup.button.callback("Token", "tokenBtn"),
        Markup.button.callback("Nft", "nftBtn"),
      ],
      this.createBtnBackAndCancel(),
    ];
  }

  private async createBtnAddressUser(
    ctx: Context,
    userName: string | undefined = undefined
  ): Promise<any> {
    let filter = !userName ? { userId: ctx.from?.id } : { userName: userName };
    const user = await userModel.findOne(filter).lean();
    if (user && user.wallets && user.wallets.length > 0) {
      const buttons = [
        user.wallets.map((wallet: any) =>
          Markup.button.callback(wallet.address, `transfer-${wallet.address}`)
        ),
      ];
      buttons.push(this.createBtnBackAndCancel());
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
    // console.log(this.#listAction);
  }

  private handleUserNameBtn(): void {
    this.#bot.action("userNameBtn", async (ctx) => {
      await ctx.answerCbQuery();
      const currentAction = this.getCurrentAction();
      await ctx.deleteMessage(currentAction?.messageId);

      await this.menu(
        "Enter the user name of telegram you want to transfer",
        this.createBtnBackAndCancel(),
        "InputUserName",
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
        this.createBtnBackAndCancel(),
        "InputAddress",
        ctx
      );
    });
  }

  private async handleCommonButtonAction(
    ctx: Context,
    title: string,
    type: string
  ): Promise<void> {
    await ctx.answerCbQuery();
    const currentAction = this.getCurrentAction();
    await ctx.deleteMessage(currentAction?.messageId);

    await this.menu(title, this.createBtnBackAndCancel(), type, ctx);
  }

  private handleMenuTypeToken(): void {
    this.#bot.action("nativeBtn", async (ctx: Context) => {
      this.#infoTransfer.type = "native";
      await this.handleCommonButtonAction(
        ctx,
        "Enter amount you want to transfer",
        "InputAmount"
      );
    });

    this.#bot.action("tokenBtn", async (ctx: Context) => {
      this.#infoTransfer.type = "token";
      await this.handleCommonButtonAction(
        ctx,
        "Enter the address of token you want to transfer",
        "InputToken"
      );
    });

    this.#bot.action("nftBtn", async (ctx: Context) => {
      this.#infoTransfer.type = "nft";
      await this.handleCommonButtonAction(
        ctx,
        "Enter the address of nft you want to transfer",
        "InputToken"
      );
    });
  }

  private handleBtnAddressUser(): void {
    this.#bot.action(/transfer-\d+/, async (ctx) => {
      await ctx.answerCbQuery();

      const currentAction = this.getCurrentAction();
      await ctx.deleteMessage(currentAction?.messageId);

      const walletId = (ctx.callbackQuery as any)?.data.split("-")[1];

      const menu =
        this.#infoTransfer.toAdd === "" && this.#infoTransfer.amount === ""
          ? this.createTypeToken()
          : this.createConfirmTransfer();

      const title =
        this.#infoTransfer.toAdd === "" && this.#infoTransfer.amount === ""
          ? "Please choose type token for transfer:"
          : "You sure for transfer ?";

      this.#infoTransfer.toAdd === "" && this.#infoTransfer.amount === ""
        ? (this.#infoTransfer.toAdd = walletId)
        : (this.#infoTransfer.fromAdd = walletId);

      if (this.#infoTransfer.fromAdd !== "") {
        await ctx.reply("Information transfer");
        await ctx.reply(JSON.stringify(this.#infoTransfer));
      }

      await this.menu(title, menu, undefined, ctx);
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
            await ctx.deleteMessage(currentAction?.messageId);
            let btn = await this.createBtnAddressUser(ctx, userInput);
            this.getPreviousAction();

            let til =
              btn.length != 0
                ? `Please select the address of ${ctx.message.text} you want to transfer:`
                : "Enter the user name you want to transfer user name of telegram not found. Please enter again!!!";
            let tilInput =
              btn.length != 0 ? undefined : currentAction?.titleInput;
            btn = btn.length != 0 ? btn : currentAction?.menu;

            await this.menu(til, btn, tilInput, ctx);
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
            const button = await this.createBtnAddressUser(ctx);
            await this.menu(
              "Please choose address of your to transfer:",
              button,
              undefined,
              ctx
            );
            break;
          //todo
          case "InputToken":
            this.#infoTransfer.tokenAddr = userInput;
            // delete message current
            await ctx.deleteMessage(currentAction?.messageId);
            const title =
              this.#infoTransfer.type === "token"
                ? "Please input amount token:"
                : "Please input index of NFT:";
            await this.menu(
              title,
              this.createBtnBackAndCancel(),
              "InputAmount",
              ctx
            );
            break;
          default:
            break;
        }
      }
    });
  }

  private delValue(): void {
    this.#infoTransfer = {
      fromAdd: "",
      toAdd: "",
      amount: "",
      tokenAddr: "",
      type: "",
    };
    this.#listAction = [];
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
      this.handleBtnAddressUser();

      this.#bot.action("cancelBtn", async (ctx) => {
        await ctx.answerCbQuery();
        const currentAction = this.getPreviousAction();
        await ctx.deleteMessage(currentAction?.messageId);

        await ctx.reply("Cancel transfer success");

        this.delValue();
      });

      this.#bot.action("backBtn", async (ctx) => {
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

        await ctx.reply("Wait for transfer");

        console.log(this.#infoTransfer);
        const { fromAdd, toAdd, tokenAddr, amount, type } = this.#infoTransfer;
        const result = await transferWalletUtil.transfer(
          fromAdd,
          toAdd,
          tokenAddr,
          amount,
          type
        );

        ctx.replyWithMarkdown(`\`\`\`json\n${JSON.stringify(result)}\n\`\`\``);
        // ctx.replyWithHTML(`<pre>${result}</pre>`);

        this.delValue();
      });
    });
  }
}

export { TransferBotHelper };
