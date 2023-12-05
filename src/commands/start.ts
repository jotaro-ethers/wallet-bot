import { Context } from 'telegraf';
import * as path from 'path';
import  { WalletInfo, generateWalletInfo } from '../helpers/utils';

const assetsFolderPath = path.join(__dirname, '..', 'assets');

export async function start(ctx: Context) {
  const userId = ctx.message?.from.id;
  console.log(ctx.message);
  const firstName = ctx.message?.from.first_name;
  ctx.replyWithPhoto(
    { source: `${assetsFolderPath}/start.jpg`},
    {
      caption: `Hello ${firstName}! 🤖\nThis is the official VictelPay bot.\n💰/wallet - All things you need to connect with viction`,
    }
  );
  const walletInfo: WalletInfo = generateWalletInfo();
}