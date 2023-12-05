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
        nativeBalance:{type:Number,default:0},
        nativeBalance24h:{type:Number,default:0},
        nativeBalance7d:{type:Number,default:0},
        c98Balance:{type:Number,default:0},
        c98Balance24h:{type:Number,default:0},
        c98Balance7d:{type:Number,default:0},
    }],
    
});

export const userModel = mongoose.model("user",UserSchema);