import { ethers } from "ethers";
import { userModel } from "../database/models/user";

import abiErc20 from "../contract/abi/Erc20.json";
import abiErc721 from "../contract/abi/Erc721.json";

import { Config } from "../config/config";

class TransferWalletUtil {
  #provider: ethers.JsonRpcProvider;

  constructor() {
    this.#provider = new ethers.JsonRpcProvider(Config.RPC_HTTP);
  }

  async sendTokenNative(
    fromAddr: string,
    toAddr: string,
    amount: string,
    privateKey: string
  ): Promise<Object> {
    const signer = new ethers.Wallet(privateKey, this.#provider);
    const data: ethers.TransactionRequest = {
      to: toAddr,
      value: ethers.parseEther(amount),
    };
    try {
      const transaction = await signer.sendTransaction(data);
      console.log("Transaction log: ", transaction);
      return { status: "success", transaction };
    } catch (error) {
      console.log(error);
      return { status: "fail", errors: error };
    }
  }

  async sendToken(
    fromAddr: string,
    toAddr: string,
    tokenAddr: string,
    value: string,
    privateKey: string
  ): Promise<Object> {
    const signer = new ethers.Wallet(privateKey, this.#provider);
    try {
      const contractToken = new ethers.Contract(tokenAddr, abiErc20, signer);

      const decimals = await contractToken.decimals();
      let balance = await contractToken.balanceOf(fromAddr);
      console.log("BalanceOf: ", ethers.formatUnits(balance, decimals));

      const amount = ethers.parseUnits(value, decimals);

      const tx = await contractToken.transfer(toAddr, amount);
      console.log("TRANSACTION: ", tx);

      balance = await contractToken.balanceOf(fromAddr);
      console.log("BalanceOf: ", ethers.formatUnits(balance, decimals));
      return { status: "success", tx };
    } catch (error) {
      console.log(error);
      return { status: "fail", errors: error };
    }
  }

  async sendNft(
    fromAddr: string,
    toAddr: string,
    nftAddr: string,
    tokenId: string,
    privateKey: string
  ): Promise<Object> {
    const signer = new ethers.Wallet(privateKey, this.#provider);
    try {
      const contractToken = new ethers.Contract(nftAddr, abiErc721, signer);

      let balance = await contractToken.balanceOf(fromAddr);
      console.log("BalanceOf: ", balance);

      const tx = await contractToken.safeTransferFrom(
        fromAddr,
        toAddr,
        tokenId
      );
      console.log("TRANSACTION: ", tx);

      balance = await contractToken.balanceOf(fromAddr);
      console.log("BalanceOf: ", balance);

      return { status: "success", tx };
    } catch (error) {
      console.log(error);
      return { status: "fail", errors: error };
    }
  }

  async transfer(
    fromAddr: string,
    toAddr: string,
    tokenAddr: string = "",
    amount: string,
    type: string
  ): Promise<Object> {
    const privateKey = await userModel.aggregate([
      { $unwind: "$wallets" },
      { $match: { "wallets.address": fromAddr } },
      { $project: { _id: 0, privateKey: "$wallets.privateKey" } },
    ]);

    let result: Object;
    if (type === "native") {
      result = await this.sendTokenNative(
        fromAddr,
        toAddr,
        amount,
        privateKey[0]?.privateKey
      );
    } else if (type === "token") {
      result = await this.sendToken(
        fromAddr,
        toAddr,
        tokenAddr,
        amount,
        privateKey[0]?.privateKey
      );
    } else {
      result = await this.sendNft(
        fromAddr,
        toAddr,
        tokenAddr,
        amount,
        privateKey[0]?.privateKey
      );
    }
    return result;
  }
}

export { TransferWalletUtil };
