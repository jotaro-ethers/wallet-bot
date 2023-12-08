import mongoose,{Schema,Document} from "mongoose";

const UserSchema:Schema = new Schema({
    userId:{
        type:Number,
        required:true,
        unique:true
    },
    userName:{
        type:String,
    },
    wallets:[{
        address:{ type:String},
        privateKey:{ type:String},
        mnemonic:{ type:String},
        oneidNames:{ type:[String],default:[]},
    }],
    
});

export const userModel = mongoose.model("user",UserSchema);