import { promisify } from 'util';
const delay = promisify(setTimeout);
import * as utilsdata from './utilsdata';
import { connectToDatabase } from '../database/database';
import {Telegraf}from 'telegraf';

import {Config} from '../config/config';
import Web3 from 'web3';
var httpWeb3 = new Web3("wss://ws.tomochain.com")
let Block = 0;
const NameToken: Web3 = new Web3(new Web3.providers.WebsocketProvider("wss://ws.tomochain.com"));
const bot = new Telegraf(Config.TELEGRAM_TOKEN);
connectToDatabase()
  .then(() => {
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
})

async function scanLog({ fromBlock }: { fromBlock: number }) {

    try {
        const latestBlock = await httpWeb3.eth.getBlockNumber();
        if(Block == 0){
          
           
            console.log("Present block:"+latestBlock);
            const logs = await httpWeb3.eth.getBlock(latestBlock, true);
            Block = Number(latestBlock);
            var txhash: string[] = []
            const Logtransactions = []
            for(var i= 0; i < logs.transactions.length; i++){
                var Txhash =(logs.transactions[i] as { hash?: string }).hash?.toString() ?? "";
                if (!txhash.includes(Txhash)) {
                    txhash.push(Txhash);
                    Logtransactions.push(logs.transactions[i]);
                }

            }
            
            for (var i = 0; i < Logtransactions.length; i++) {
                const to = (Logtransactions[i] as any)?.to;
                const from = (Logtransactions[i] as any)?.from;
                const value:bigint = (Logtransactions[i] as any)?.value;
                const realvalue: number = Number(value) / 10**18;

                const input = (Logtransactions[i] as any)?.input;
                if(input as string != "0x"){
                    const hexString = input as string;

                    var toAdd = hexString.slice(10, 74);
                    var valuetransfer = hexString.slice(74);

                    toAdd = toAdd.replace(/^0+/, '');
                    toAdd = "0x" + toAdd;
                    var Valuetransfer = parseInt(valuetransfer, 16);
                    const RealValuetransfer = Valuetransfer / 10**18;
                    var AddressS: string[] = await utilsdata.getalladdress();
                    if (AddressS.includes(toAdd as string)){
                        var contract = new NameToken.eth.Contract(Config.ABI, to);
                        var name = await contract.methods.name().call();
                        var symbol = await contract.methods.symbol().call();

                        console.log(from + " send to " + toAdd + " : " + RealValuetransfer+" "+name);
                        var userID: string = await utilsdata.getIDbyaddress(toAdd as string);
                        const telegramID: number = parseFloat(userID);
                        const htmlMessage = `Received ${RealValuetransfer} ${name} ($${symbol}) from ${from} \nView on block explorer : https://www.vicscan.xyz/tx/${txhash[i]}`;
                        const pin = await bot.telegram.sendMessage(telegramID, htmlMessage);
                        bot.telegram.pinChatMessage(telegramID, pin.message_id);
                        
                    } 
                    if (AddressS.includes(from as string)) {
                        var contract = new NameToken.eth.Contract(Config.ABI, to);
                        var name = await contract.methods.name().call();
                        var symbol = await contract.methods.symbol().call();

                        console.log("Your wallet "+from + " send to " + toAdd + " : " + RealValuetransfer+" "+name);
                        var userID: string = await utilsdata.getIDbyaddress(from as string);
                        const telegramID: number = parseFloat(userID);
                        const htmlMessage = `Sent ${RealValuetransfer} ${name} ($${symbol}) from ${from} to ${toAdd} \nView on block explorer : https://www.vicscan.xyz/tx/${txhash[i]}`;
                        const pin = await bot.telegram.sendMessage(telegramID,htmlMessage);
                        bot.telegram.pinChatMessage(telegramID, pin.message_id);
                    }
                }
                else{
                    var AddressS: string[] = await utilsdata.getalladdress();
                    if (AddressS.includes(to as string)) {
                        console.log(from + " send to " + to + " : " + realvalue);
                        var userID: string = await utilsdata.getIDbyaddress(to as string);
                        const telegramID: number = parseFloat(userID);
                        console.log(telegramID);
                        const htmlMessage = `Received ${realvalue} Viction ($VIC) from ${from} \nView on block explorer : https://www.vicscan.xyz/tx/${txhash[i]}`;
                        const pin = await bot.telegram.sendMessage(telegramID,htmlMessage);
                        bot.telegram.pinChatMessage(telegramID, pin.message_id);
                    }
                    if (AddressS.includes(from as string)) {
                        console.log(from + " send to " + to + " : " + realvalue);
                        var userID: string = await utilsdata.getIDbyaddress(from as string);
                        const telegramID: number = parseFloat(userID);
                        console.log(telegramID);
                        const htmlMessage = `Sent ${realvalue} Viction ($VIC) from ${from} to ${to} \nView on block explorer : https://www.vicscan.xyz/tx/${txhash[i]}`;
                        const pin = await bot.telegram.sendMessage(telegramID,htmlMessage);
                        bot.telegram.pinChatMessage(telegramID,pin.message_id);
                    }
                }
              
                
            }
          
        }else{
            for (var blockcount = Number(Block)+1; blockcount <= Number(latestBlock); blockcount++){
                console.log("Present block:"+blockcount);
                const logs = await httpWeb3.eth.getBlock(blockcount, true);

                var txhash: string[] = []
                const Logtransactions = []
                for(var i= 0; i < logs.transactions.length; i++){
                    var Txhash =(logs.transactions[i] as { hash?: string }).hash?.toString() ?? "";
                    if (!txhash.includes(Txhash)) {
                        txhash.push(Txhash);
                        Logtransactions.push(logs.transactions[i]);
                    }

                }
                for (var i = 0; i < Logtransactions.length; i++) {
                    const to = (Logtransactions[i] as any)?.to;
                    const from = (Logtransactions[i] as any)?.from;
                    const value:bigint = (Logtransactions[i] as any)?.value;
                    const realvalue: number = Number(value) / 10**18;
                    const input = (Logtransactions[i] as any)?.input;
                    if(input as string != "0x"){
                        const hexString = input as string;
    
                        var toAdd = hexString.slice(10, 74);
                        var valuetransfer = hexString.slice(74);
                        toAdd = toAdd.replace(/^0+/, '');
                        toAdd = "0x" + toAdd;
                        var Valuetransfer = parseInt(valuetransfer, 16);
                        const RealValuetransfer = Valuetransfer / 10**18;

                        var AddressS: string[] = await utilsdata.getalladdress();
                        if (AddressS.includes(toAdd as string)){
                            var contract = new NameToken.eth.Contract(Config.ABI, to);
                            var name = await contract.methods.name().call();
                            var symbol = await contract.methods.symbol().call();
                            console.log(from + " send to " + toAdd + " : " + RealValuetransfer + " " + name);

                            var userID: string = await utilsdata.getIDbyaddress(toAdd as string);
                            const telegramID: number = parseFloat(userID);
                            const htmlMessage = `Received ${RealValuetransfer} ${name} ($${symbol}) from ${from} \nView on block explorer : https://www.vicscan.xyz/tx/${txhash[i]}`;
                            const pin = await bot.telegram.sendMessage(telegramID, htmlMessage);
                            bot.telegram.pinChatMessage(telegramID, pin.message_id);
                        } 
                        if (AddressS.includes(from as string)) {
                            var contract = new NameToken.eth.Contract(Config.ABI, to);
                            var name = await contract.methods.name().call();
                            var symbol = await contract.methods.symbol().call();

                            console.log("Your wallet "+from + " send to " + toAdd + " : " + RealValuetransfer+" "+name);
                            var userID: string = await utilsdata.getIDbyaddress(from as string);
                            const telegramID: number = parseFloat(userID);
                            const htmlMessage = `Sent ${RealValuetransfer} ${name} ($${symbol}) from ${from} to ${toAdd} \nView on block explorer : https://www.vicscan.xyz/tx/${txhash[i]}`;
                            const pin = await bot.telegram.sendMessage(telegramID,htmlMessage);
                            bot.telegram.pinChatMessage(telegramID, pin.message_id);
                        }
                    }
                    else{
                        var AddressS: string[] = await utilsdata.getalladdress();
                        if (AddressS.includes(to as string)) {
                            console.log(from + " send to " + to + " : " + realvalue);
                            var userID: string = await utilsdata.getIDbyaddress(to as string);
                            const telegramID: number = parseFloat(userID);
                            console.log(telegramID);
                            const htmlMessage = `Received ${realvalue} Viction ($VIC) from ${from} \nView on block explorer : https://www.vicscan.xyz/tx/${txhash[i]}`;
                            const pin = await bot.telegram.sendMessage(telegramID,htmlMessage);
                            bot.telegram.pinChatMessage(telegramID, pin.message_id);
                        
                        }
                        if (AddressS.includes(from as string)) {
                            console.log(from + " send to " + to + " : " + realvalue);
                            var userID: string = await utilsdata.getIDbyaddress(from as string);
                            const telegramID: number = parseFloat(userID);
                            console.log(telegramID);
                            const htmlMessage = `Sent ${realvalue} Viction ($VIC) from ${from} to ${to} \nView on block explorer : https://www.vicscan.xyz/tx/${txhash[i]}`;
                            const pin = await bot.telegram.sendMessage(telegramID,htmlMessage);
                            bot.telegram.pinChatMessage(telegramID,pin.message_id);
                        }
                    }
                  
                   
                }
                Block = blockcount;
            }
        
        }
     
        
    } catch (error) {
        console.error('Error in scanLog:', error);
    }
}

export async function start() {
    while (true) {
        try {
            console.log('--------------------------START SCAN------------------------------------------');
            await scanLog({fromBlock:Block});
            console.log('--------------------------STOP SCAN-------------------------------------------');
            await delay(2000);
        } catch (error) {
            console.error('Error in start:', error);
        }
    }

}

start();
