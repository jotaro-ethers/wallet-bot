import { userModel } from '../database/models/user';


export const saveWalletInfo = async (
    userId: number | undefined,
    walletInfo: any
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
          oneidNames: walletInfo.oneidNames || [],
          nativeBalance: walletInfo.nativeBalance || 0,
          c98Balance: walletInfo.c98Balance || 0,
        });
        await user.save();
      } else {
        const newUser = new userModel({
          userId: userId,
          wallets: [
            {
              address: walletInfo.address,
              privateKey: walletInfo.privateKey,
              oneidNames: walletInfo.oneidNames || [],
              nativeBalance: walletInfo.nativeBalance || 0,
              c98Balance: walletInfo.c98Balance || 0,
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