import Transaction from '../classes/Transaction';
import { getKeys } from '../config/utils';
import web3 from '../config/web3';
import logger from '../config/winston';
import { Request, Response } from 'express';

export async function transfer(req: Request, res: Response) {
  try {
    const { address, privateKey } = await getKeys({
      email: req.body.email,
      passphrase: req.body.passphrase
    });

    const balance = await web3.eth.getBalance(address);

    if (Number(web3.utils.fromWei(balance)) < Number(req.body.value)) {
      throw Error('Not sufficient funds');
    }

    const tx = new Transaction({ fromAddress: address });
    await tx.estimateGas();
    await tx.getNonce();
    tx.prepareRawTx({
      value: req.body.value,
      to: req.body.to,
      gaslimit: 4000000
    })
      .sign(privateKey)
      .serialize();

    const txHash = await tx.send();

    logger.info(`Transfered ${req.body.value} to ${req.body.to} `, {
      txHash: txHash
    });
    res.json({ txHash });
  } catch (e) {
    logger.error(`Couldn't transfer ${req.body.value} to ${req.body.to} `, {
      message: e.message
    });
    res.status(400).json({ error: e.message });
  }
}