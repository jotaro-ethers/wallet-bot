abstract class TransferWalletHelper {
  #rpc: string = "";

  constructor(rpc: string) {
    this.#rpc = rpc;
  }

  public set rpc(rpc: string) {
    this.#rpc = rpc;
  }

  TransferNativeToken(
    fromAddr: string,
    toAddr: string,
    amount: number
  ): string {
    return "";
  }

  TransferToken(
    fromAddr: string,
    toAddr: string,
    tokenAddr: string,
    amount: number
  ): string {
    return "";
  }
}
