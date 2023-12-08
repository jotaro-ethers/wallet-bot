import { userModel } from "../database/models/user";
import { WalletInfo } from "./utils";
import web3 from "../config/connectWallet";
import abi from "../contract/abi/abi.json";
import { AbiFragment } from "web3";
import { Context } from "telegraf";
const ERC20_ABI: AbiFragment[] = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_from",
        type: "address",
      },
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
      {
        name: "_spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
];
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

export const getBalance = async (
  ctx: Context
): Promise<{ balance: string; err: Error }> => {
  let token_address: string = "";
  try {
    if ('text' in ctx.message!) {
      token_address = ctx.message.text;
    }
    console.log(token_address)

    if (token_address == "") {
      throw new Error("token_address is undefined");
    }
    if (token_address.length != 42) {
      throw new Error("length of token_address incorrect");
    }
    
    token_address = token_address?.toLowerCase();
    token_address = web3.utils.toChecksumAddress(String(token_address));
    const contract = new web3.eth.Contract(abi, String(token_address), web3);
    const user_address = "0x7D5D710FDc4267619570A2f0E80bA4532415E608";
    const balance = await (contract.methods.balanceOf as any)(
      user_address
    ).call();

    return {
      balance: balance,
      err: Error(),
    };
  } catch (err: any) {
    return {
      balance: "",
      err: err,
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
