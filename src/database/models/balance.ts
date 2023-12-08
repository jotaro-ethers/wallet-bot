import mongoose,{Schema} from "mongoose";

const BalanceSchema:Schema = new Schema({
    address:{
        type:String,
        required:true,
        unique:true
    },
    balances:[{
        tokenAddress:{ type:String},
        tokenName:{ type:String},
        tokenSymbol:{ type:String},
        balance:{ type:[Number]},
        required:true,
    }],
});
export const balanceModel = mongoose.model("balance",BalanceSchema);