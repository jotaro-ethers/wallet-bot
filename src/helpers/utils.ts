import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { userModel } from '../database/models/user';
import { Context } from 'telegraf';
import {getBalance} from "./utilsdata"
import { Update } from 'telegraf/typings/core/types/typegram';

export interface WalletInfo {
  mnemonic: string;
  privateKey: string;
  address: string;
}

export function generateWalletInfo(): WalletInfo {
  const mnemonic = bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdNode = ethers.HDNodeWallet.fromSeed(seed);
  const wallet = hdNode.derivePath(`m/44'/60'/0'/0/0`);
  const privateKey = wallet.privateKey;
  const address = wallet.address;

  return {
    mnemonic,
    privateKey,
    address,
  };
}
