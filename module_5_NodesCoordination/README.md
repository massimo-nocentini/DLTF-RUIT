# On demand decentralized oracles forblockchain: a new Chainlink basedarchitecture
This repository contains the implementation of the *Deposit Controller System* (DCS) mentioned in the [thesis](). DCS is a system used to protect users with gambling addiction by helping them limit the amount of money they can spend on gambling DAPPs. It is based on **DIABOLIK**: a new Chainlink-based flexible and reliable oracle system for on-demand objective data requests. To learn more, see the work here [HERE]()

## DIrectory listing
 - [/docker_containers](https://github.com/ferru97/DIABOLIK-Master-Thesis/tree/main/docker_containers) docker containers used to instantiate the oracles, the Postress DB, a Geth client, a web server. Those are specified in the [docker_compose file](https://github.com/ferru97/DIABOLIK-Master-Thesis/blob/main/docker_containers/docker-compose.yml). Currently this instantiate 10 chainlink oracle. The Postgress DB is used by the oracle to save data. The Geth client is the one used to instantiate a local blockchain. The web server is the one implementing th **middleware** cited in the thesis.
 - [/chainlink_truffle](https://github.com/ferru97/DIABOLIK-Master-Thesis/tree/main/chainlink_truffle) directory containing the truffle project used to implement and deploy the system smar contract
 - [/chainlink_go](https://github.com/ferru97/DIABOLIK-Master-Thesis/tree/main/chainlink_go) directory containing a copy of the official Chainlink core implementation. This is used to implement the *__encoded* generator tool cited below.
 - [/chainlink-custom-ocr](https://github.com/ferru97/DIABOLIK-Master-Thesis/tree/main/chainlink-custom-ocr) this directory contains the modification we made to the OCR protocol. Specifically, it contains the *report_generation_follower.go* file in which the *shouldReport* function was modified to make the protocol exclusively on-demand, as explained in the thesis. In containers that instantiate the oracles, this must replaces the original one that can be viewed [HERE](https://github.com/smartcontractkit/libocr/blob/master/offchainreporting/internal/protocol/report_generation_follower.go)

 ## Smart Contracts
The smart contracts mentioned in the thesis are available [HERE](https://github.com/ferru97/DIABOLIK-Master-Thesis/tree/main/chainlink_truffle/contracts). Some of these mentioned in the work are:

- [OCR-SC](https://github.com/ferru97/DIABOLIK-Master-Thesis/blob/main/chainlink_truffle/contracts/OffchainAggregator.sol) the smart contract representing the on-chain part of and Off-chain reporting job
- [DR-SC](https://github.com/ferru97/DIABOLIK-Master-Thesis/blob/main/chainlink_truffle/contracts/Operator.sol) the smart contract representing the on-chain part of and Direct Request job
- [AccessController](https://github.com/ferru97/DIABOLIK-Master-Thesis/blob/main/chainlink_truffle/contracts/AccessController.sol) the Access Controlle contract used for the deployment of OCR-SC
- [ReqManager-SC](https://github.com/ferru97/DIABOLIK-Master-Thesis/blob/main/chainlink_truffle/contracts/RequestManager.sol) smart-contract managing the requests coming from the various USER-SC
- [Gambling-SC](https://github.com/ferru97/DIABOLIK-Master-Thesis/blob/main/chainlink_truffle/contracts/Gambling.sol) smart contract implement a gambling application

### Deploy (Hardhat + Sepolia)
This repo originally used Truffle + a local Geth chain; for Sepolia you can deploy the same contracts with Hardhat.

From `DIABOLIK-Master-Thesis/chainlink_truffle`:
```sh
npx hardhat compile
# Set env vars in .env (see .env.example), then:
npx hardhat run scripts/deploy-system.js --network sepolia
```

This writes the deployed addresses to `DIABOLIK-Master-Thesis/chainlink_truffle/deployments/system.sepolia.json`.

Notes:
- OCR requires `OCR_ENCODED_CONFIG`; you can either set it directly, or set `OCR_CONFIG_FILE`/`OCR_CONFIG_PRESET` and the deploy script will generate it via `chainlink_go/core/internal/encodeGenerator.go`.

### Legacy (Truffle)
If you still want to use the original Truffle migrations, you can keep using:
```sh
truffle migrate -f 2 --to 3 --network geth
```


## *_encoded* field generation tool
As mentioned in the thesis in Appendix 11.1.1, during the deployment of OCR-SC it is necessary to produce a piece of data to be associated with the *_encoded* parameter when calling the *setConfig* function. So we created our own tool by reverse engineering the Chainlink core test files. This tool is available [HERE](https://github.com/ferru97/DIABOLIK-Master-Thesis/blob/main/chainlink_go/core/internal/encodeGenerator.go).
