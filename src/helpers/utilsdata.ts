import { userModel } from '../database/models/user';
import { WalletInfo } from './utils';


export const saveWalletInfo = async (
    userId: number | undefined,userName: string | undefined,
    walletInfo: WalletInfo
  ): Promise<void> => {
    if (!userId) {
        console.log(userId)
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
          userName: userName ? userName :"",
          wallets: [
            {
              address: walletInfo.address,
              privateKey: walletInfo.privateKey,
              mnemonic: walletInfo.mnemonic,
            },
          ],
        });
        await newUser?.save();
      }
      console.log("Wallet info saved successfully");
    } catch (error) {
      console.error("Error saving wallet info:", error);
      throw error;
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