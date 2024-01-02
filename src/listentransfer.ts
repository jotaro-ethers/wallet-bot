import { promisify } from "util";
const delay = promisify(setTimeout);
import axios, { AxiosResponse } from "axios";
import * as utilsdata from "./helpers/utilsdata";
import { userModel } from "./database/models/user";
import { connectToDatabase } from "./database/database";
let Block = 0;

connectToDatabase()
  .then(() => {})
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

async function scanLog({ fromBlock }: { fromBlock: number }) {
  try {
    var blockapi = "https://tomoscan.io/api/block/list?limit=1";
    const response: AxiosResponse = await axios.get(blockapi);

    var latestBlock = Number(response.data.total);
    if (Block == 0) {
      Block = Number(latestBlock);
      var apiUrl = "https://tomoscan.io/api/transaction/listByBlock/";
      apiUrl = apiUrl + Block;
      console.log(apiUrl);
      const response: AxiosResponse = await axios.get(apiUrl);
      if (response.status === 200) {
        const data = response.data;
        for (var i = 0; i < data.data.length; i++) {
          if (data.data[i].method == "transfer") {
            console.log(data.data[i].to);
            var AddressS: string[] = await utilsdata.getalladdress();
            console.log(AddressS);
            if (AddressS.includes(data.data[i].to)) {
              console.log("okkkk");
            }
          }
          console.log(data.data[i].method);

          console.log("---------------------");
        }
      } else {
        console.error("Request failed with status:", response.status);
      }
    } else {
      console.log("Lastest scanblock:" + Block);
      console.log("To Block:" + latestBlock);
      console.log("Start Scan+++: ");
      for (var i = Number(Block) + 1; i <= Number(latestBlock); i++) {
        var AddressS: string[] = await utilsdata.getalladdress();
        console.log("Block: ");
        console.log(i);
        var apiUrl = "https://tomoscan.io/api/transaction/listByBlock/";
        apiUrl = apiUrl + i;
        console.log(apiUrl);
        const response: AxiosResponse = await axios.get(apiUrl);
        if (response.status === 200) {
          const data = response.data;
          for (var z = 0; z < data.data.length; z++) {
            if (data.data[z].method == "transfer") {
              console.log(data.data[z].to);

              console.log(AddressS);
              if (AddressS.includes(data.data[z].to)) {
                console.log("okkkk");
              }
            }
            console.log(data.data[z].method);

            console.log("---------------------");
          }
        } else {
          console.error("Request failed with status:", response.status);
        }
      }
      Block = Number(latestBlock);
    }
  } catch (error) {
    console.error("Error in scanLog:", error);
  }
}

export async function start() {
  while (true) {
    try {
      console.log(
        "--------------------------Present Block------------------------------------------"
      );
      await scanLog({ fromBlock: Block });

      console.log(
        "--------------------------STOP SCAN------------------------------------------"
      );
      await delay(2000);
    } catch (error) {
      console.error("Error in start:", error);
    }
  }
}

start();
