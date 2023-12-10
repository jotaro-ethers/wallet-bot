import {Web3} from "web3"
import {Config} from "./config"

const web3 = new Web3(new Web3.providers.WebsocketProvider(Config.RPC_TOMO!))

export default web3
