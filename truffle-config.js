require('ts-node/register');
require('dotenv').config();

const HDWalletProvider = require('truffle-hdwallet-provider');

const testNode = 'https://public-node.testnet.rsk.co:443';
const publicNode = 'https://public-node.rsk.co';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!

  networks: {
    testnet: {
      provider: () =>
        new HDWalletProvider(process.env.PRIVKEY_TESTNET, testNode),
      network_id: '*',
      gas: 4000000,
      gasPrice: 59240000
    },
    mainnet: {
      provider: () =>
        new HDWalletProvider(process.env.PRIVKEY_MAINNET, publicNode),
      network_id: '30',
      gas: 6800000,
      gasPrice: 60240000
    },
    docker: {
      host: 'ganachecli',
      port: 8545,
      network_id: '*',
      gas: 6800000,
      gasPrice: 65164000
    }
  }
};
