import { Transaction as ethTx } from 'ethereumjs-tx';
import web3 from '../config/web3';
import Web3 from 'web3';

class Transaction {
  contract: {
    options: { address: string };
    methods: { [key: string]: object };
  };
  method: string;
  arg: Array<string>;
  fromAddress: string;
  tx: ethTx;
  data: string;
  serializedTx: Buffer;
  gaslimit: string;
  nonce: number;
  gasprice: string;

  constructor({
    contract,
    method,
    data = [],
    fromAddress
  }: {
    method?: string;
    contract?: object;
    data?: Array<string>;
    fromAddress: string;
  }) {
    this.contract = contract;
    this.method = method;
    this.arg = data;
    this.fromAddress = fromAddress;
  }

  encodeABI() {
    this.data = this.contract.methods[this.method](...this.arg).encodeABI();
    return this;
  }

  async call() {
    try {
      return await this.contract.methods[this.method](...this.arg).call();
    } catch (e) {
      throw Error(e);
    }
  }

  async estimateGas(): Promise<any> {
    this.gasprice = await web3.eth.getGasPrice();
    return this;
  }

  async estimateGasLimit(): Promise<any> {
    this.gaslimit = await this.contract.methods[this.method](
      ...this.arg
    ).estimateGas({
      from: this.fromAddress
    });
    return this;
  }

  async getNonce(): Promise<any> {
    this.nonce = await web3.eth.getTransactionCount(this.fromAddress);
    return this;
  }

  /**
   * Prepares
   * @param {ethTx} tx Instance of ethTx Class
   * @param {Buffer} privateKey Private Key of user
   * @returns {ethTx} Signed Transaction Instance
   */
  prepareRawTx({
    value = '0',
    to = this.contract.options.address,
    gaslimit = this.gaslimit
  } = {}): any {
    let weiValue = web3.utils.toWei(value, 'ether');

    const txParams = {
      nonce: web3.utils.toHex(this.nonce),
      gasPrice: web3.utils.toHex(this.gasprice),
      gasLimit: web3.utils.toHex(gaslimit),
      to: to,
      value: web3.utils.toHex(weiValue),
      data: this.data
    };

    this.tx = new ethTx(txParams, { chain: 'testnet' });
    return this;
  }

  /**
   * Sign Transaction Instance
   * @param {ethTx} tx Instance of ethTx Class
   * @param {Buffer} privateKey Private Key of user
   * @returns {ethTx} Signed Transaction Instance
   */
  sign(privateKey: Buffer): any {
    this.tx.sign(privateKey);
    return this;
  }

  serialize(): any {
    this.serializedTx = this.tx.serialize();
    return this;
  }

  async send(): Promise<string> {
    return new Promise((resolve, reject) => {
      web3.eth.sendSignedTransaction(
        `0x${this.serializedTx.toString('hex')}`,
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
}

export default Transaction;
