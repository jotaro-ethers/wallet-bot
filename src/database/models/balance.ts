import mongoose,{Schema} from "mongoose";

const BalanceSchema:Schema = new Schema({
    address:{
        type:String,
        required:true,
        unique:true
    },
    balance:{
        type:Number,
        required:true,
    },
    timestamp:{
        type:Number,
        required:true,
    },
});
export const balanceModel = mongoose.model("balance",BalanceSchema);