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