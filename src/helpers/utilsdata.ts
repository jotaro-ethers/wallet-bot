import { userModel } from "../database/models/user";
import { WalletInfo } from "./utils";
import web3 from "../config/connectWallet";
import abi from "../contract/abi/abi.json";
import { AbiFragment } from "web3";
import { Context } from "telegraf";

export const saveWalletInfo = async (
  userId: number | undefined,
  userName: string | undefined,
  walletInfo: WalletInfo
): Promise<void> => {
  if (!userId) {
    console.log(userId);
    throw new Error("User ID is undefined");
  }

  try {
    const user = await userModel.findOne({ userId: userId });
    if (user) {
      user.wallets.push({
        address: walletInfo.address,
        privateKey: walletInfo.privateKey,
        mnemonic: walletInfo.mnemonic,
      });
      await user.save();
    } else {
      const newUser = new userModel({
        userId: userId,
        userName: userName ? userName : "",
        wallets: [
          {
            address: walletInfo.address,
            privateKey: walletInfo.privateKey,
            mnemonic: walletInfo.mnemonic,
          },
        ],
      });
      await newUser.save();
    }
    console.log("Wallet info saved successfully");
  } catch (error) {
    console.error("Error saving wallet info:", error);
    throw error;
  }
};

export const getNativeBalance = async (userId: number | undefined) => {
  const user = await userModel.findOne({
    userId: userId,
  });

  if (!user) {
    throw new Error("User ID is undefined");
  }
  const wallet_address = user.wallets[0].address;
  const balance = await web3.eth.getBalance(wallet_address);

  return web3.utils.fromWei(balance, "ether");
};

export const getBalance = async ( user_address: string,token_address: string
): Promise<{ balance: number }> => {;
  try {
    token_address = token_address?.toLowerCase();
    token_address = web3.utils.toChecksumAddress(String(token_address));
    const contract = new web3.eth.Contract(abi, String(token_address), web3);
    const balance = await (contract.methods.balanceOf as any)(
      user_address
    ).call();

    return {
      balance: balance,
    };
  } catch (err: any) {
    return {
      balance: 0,
    };
  }
};



export const deleteWallet = async (
  userId: number | undefined, address: string | undefined

): Promise<void> => {

  try{
    const user = await userModel.findOne({ userId: userId });
  if (user) {
      for (var i = 0; i < user.wallets.length; i++) {
          if (user.wallets[i].address == address) {
              user.wallets.splice(i, 1);
              await user.save();
              
          }
      }

  } else {
      console.log("User not found");
  }
  }catch (error) {
    console.log("Error deleting wallet info:", error);
  }

  
};
export const getalladdress = async (
  ): Promise<string[]> =>{
    var AddressS: string[] = [];
  
      const user = await userModel.find({ });
        for (var i = 0; i < user.length; i++){
          for(var j = 0; j < user[i].wallets.length; j++){
            AddressS.push(user[i].wallets[j].address.toLowerCase());
          }
        }
    
    return AddressS
  
  }
  
  export const getIDbyaddress = async (address: string
    ): Promise<string> =>{
      var ID: string = "";
      const user = await userModel.findOne({ wallets: { $elemMatch: { address: address } } });
      if (user) {
        ID = user.userId.toString();
      } else {
          console.log("User not found");
      }
      return ID;
    }
    