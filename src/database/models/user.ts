import mongoose,{Schema,Document} from "mongoose";
interface IUser extends Document{
    userId:string;
    userName:string;
    wallets:{
        address:string;
        privateKey:string;
        oneidNames:string[];
        nativeBalance:number;
        c98Balance:number;
    }[];
}
const UserSchema:Schema = new Schema({
    userId:{
        type:String,
        required:true,
        unique:true
    },
    userName:{
        type:String,
    },
    wallets:{
        address:{ type:String},
        privateKey:{ type:String},
        oneidNames:{ type:[String],default:[]},

    },
    nativeBalance:{type:Number,default:0},
    c98Balance:{type:Number,default:0}
});
export const User = mongoose.model<IUser>("User",UserSchema);