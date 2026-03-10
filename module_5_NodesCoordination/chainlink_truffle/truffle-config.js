const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()

const mnemonic = "weekend junk brush invest dinosaur lucky peace venture special curtain bring prepare" //process.env.MNEMONIC
const url = process.env.RPC_URL
const geth_pk = "e2e442f6c60d60305f75e4a1aa5f53e0d42c5d78fd5090b5b00c6603e1281fd1"

module.exports = {
  networks: {
    cldev: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
    ganache: {
      host: '192.168.1.11',
      port: 7545,
      network_id: '*',
    },
    geth: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://192.168.1.11:8545")
      },
      from: "0xdB037f36AA49DfBbb542f9A29D6506912A0AaB73",
      network_id: '1337',
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "wss://rinkeby.infura.io/ws/v3/99b562d80026460c830b5b4e853be5a1")
      },
      from: "0xdB037f36AA49DfBbb542f9A29D6506912A0AaB73", // default address to use for any transaction Truffle makes during migrations
      network_id: "4",
      //confirmations: 10,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    binance_testnet: {
      provider: () => new HDWalletProvider(mnemonic,'https://data-seed-prebsc-1-s1.binance.org:8545'),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    kovan: {
      provider: () => {
        return new HDWalletProvider(mnemonic, url)
      },
      network_id: '42',
      skipDryRun: true
    },
  },
  compilers: {
    solc: {
      version: '0.7.2',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },
  },
}
