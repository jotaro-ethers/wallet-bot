import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { userModel } from '../database/models/user';
import { Context } from 'telegraf';
import {getBalance} from "./utilsdata"
import { Update } from 'telegraf/typings/core/types/typegram';
import { timeStamp } from 'console';
import axios, { AxiosResponse, AxiosError } from 'axios';
import web3 from '../config/connectWallet';
import * as Utilsdata from './utilsdata';
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

export function timeout(ms: number): boolean {
  const timestamp = Date.now()/1000;
  return timestamp - ms < 60 ? false : true;
}

export async function trackWallet(address = "0x1db6Ad727aE60d7b4dBee81f79C4bCbCfF8759F8")  {
  try {
    var tokens = [];
    var totalRemain = 0;
    address = "0x0A8484C8e45295d78Eb4D8922690c326A3473bbe"
    const response: AxiosResponse = await axios.get('https://tomoscan.io/api/token/list?offset=0&limit=14');
    const data = response.data.data;
    for (const element of data) {
      // const token = await axios.get(`https://tomoscan.io/api/account/${address}/tokenBalanceOf?tokenAddress=${element.address}`);
      // const tokenInfor = token.data;
      const tokenBalanceOf = await Utilsdata.getBalance(address,element.address);
      const decimals = element.decimals;
      const balance = Number(tokenBalanceOf.balance)/10**decimals;
      
      if (balance > 0){
        tokens.push({
          name: element.name,
          symbol: element.symbol,
          balance: balance,
          price: element.price,
          priceChangePercentage : element.priceChangePercentage,
          priceChange: element.priceChange,
          remain : element.price * balance
        });
        totalRemain += element.price * balance;
        };
      };
    return {tokens : tokens, totalRemain : totalRemain};  
  } catch (error) {
    return {tokens : "", totalRemain : ""};
  }
}