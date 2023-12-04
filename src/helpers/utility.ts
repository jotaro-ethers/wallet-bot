import * as bip39 from 'bip39';
import { ethers } from 'ethers';

export interface WalletInfo {
  mnemonic: string;
  privateKey: string;
  address: string;
}

export function generateWalletInfo(): WalletInfo {
  const mnemonic = bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeedSync("host awful nerve make will elder artist ocean cup evidence shine aisle");
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
