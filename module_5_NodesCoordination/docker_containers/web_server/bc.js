const Web3 = require('web3');
const utils = require('./utils');
const keccak256 = require('keccak256')

//const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/99b562d80026460c830b5b4e853be5a1"));
const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.11:8545"));

const reqManagerABI = [ { "inputs": [ { "internalType": "uint256", "name": "_dataFetchLinkCost", "type": "uint256" }, { "internalType": "address", "name": "_DRcontract", "type": "address" }, { "internalType": "bytes32", "name": "_jobID", "type": "bytes32" }, { "internalType": "address", "name": "_link", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" } ], "name": "ChainlinkCancelled", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" } ], "name": "ChainlinkFulfilled", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "id", "type": "bytes32" } ], "name": "ChainlinkRequested", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "string", "name": "msg", "type": "string" }, { "indexed": false, "internalType": "uint64", "name": "roundID", "type": "uint64" } ], "name": "DataReceived", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint64", "name": "rId", "type": "uint64" } ], "name": "NewRequest", "type": "event" }, { "inputs": [], "name": "DRcontract", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "OCRcontract", "outputs": [ { "internalType": "contract OffchainAggregator", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "currReq", "outputs": [ { "internalType": "uint64", "name": "", "type": "uint64" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "dataFetchLinkCost", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "jobID", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "link", "outputs": [ { "internalType": "contract LinkTokenInterface", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "maxReqTime", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "reqId", "outputs": [ { "internalType": "uint64", "name": "", "type": "uint64" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "uint64", "name": "", "type": "uint64" } ], "name": "requestsQueue", "outputs": [ { "internalType": "contract ResultCallbackInterface", "name": "requester", "type": "address" }, { "internalType": "uint128", "name": "dataHash", "type": "uint128" }, { "internalType": "uint256", "name": "OCRstartTime", "type": "uint256" }, { "internalType": "uint256", "name": "OCRendTime", "type": "uint256" }, { "internalType": "uint256", "name": "dataReceivedTime", "type": "uint256" }, { "internalType": "address", "name": "respondingOracle", "type": "address" }, { "internalType": "uint256", "name": "depositTime", "type": "uint256" }, { "internalType": "uint256", "name": "amountDeposited", "type": "uint256" }, { "internalType": "uint256", "name": "linkPayed", "type": "uint256" }, { "internalType": "address payable", "name": "user", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "uint256", "name": "_depositTime", "type": "uint256" }, { "internalType": "address payable", "name": "_user", "type": "address" } ], "name": "makeObservation", "outputs": [ { "internalType": "uint64", "name": "", "type": "uint64" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "tryNewRound", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint64", "name": "id", "type": "uint64" }, { "internalType": "uint128", "name": "data", "type": "uint128" }, { "internalType": "uint256", "name": "linkRefunded", "type": "uint256" } ], "name": "hashCallback", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "requestID", "type": "bytes32" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint64", "name": "queueID", "type": "uint64" } ], "name": "dataCallback", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint64", "name": "_reqID", "type": "uint64" } ], "name": "getRequest", "outputs": [ { "components": [ { "internalType": "contract ResultCallbackInterface", "name": "requester", "type": "address" }, { "internalType": "uint128", "name": "dataHash", "type": "uint128" }, { "internalType": "uint256", "name": "OCRstartTime", "type": "uint256" }, { "internalType": "uint256", "name": "OCRendTime", "type": "uint256" }, { "internalType": "uint256", "name": "dataReceivedTime", "type": "uint256" }, { "internalType": "address", "name": "respondingOracle", "type": "address" }, { "internalType": "uint256", "name": "depositTime", "type": "uint256" }, { "internalType": "uint256", "name": "amountDeposited", "type": "uint256" }, { "internalType": "uint256", "name": "linkPayed", "type": "uint256" }, { "internalType": "address payable", "name": "user", "type": "address" } ], "internalType": "struct RequestManager.Request", "name": "", "type": "tuple" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "address", "name": "addr", "type": "address" } ], "name": "setOCRcontract", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "time", "type": "uint256" } ], "name": "setMaxReqTime", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "ququeSize", "outputs": [ { "internalType": "int256", "name": "", "type": "int256" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "getMaxRequestLINKCost", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function", "constant": true } ]
const DepositLimitationABI =  [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "contractOwner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "depositSelfLimitation", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "gamblingDapps", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address[]", "name": "_gamblingDapps", "type": "address[]" } ], "name": "setGamblingDapps", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "selfLimitation", "type": "uint256" } ], "name": "setSelfMonthlyLimitation", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" } ], "name": "getSelfMonthlyLimitation", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getGamblingDappsList", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" } ]


async function getDataHash(req_manager, res, saveOracleData, oid, depositlimitation_sc){
    try{
        const managerContract = await new web3.eth.Contract(reqManagerABI, req_manager)
        const currReq = await managerContract.methods.currReq.call().call()
        const request = await managerContract.methods.getRequest(currReq).call()
        if(request.user == "0x0000000000000000000000000000000000000000"){
            res.status(200).send("0"); 
            return
        }
        const player = request.user
        const period = request.depositTime

        const depositLimitationContract = await new web3.eth.Contract(DepositLimitationABI, depositlimitation_sc)
        const gambling_sc_list = await depositLimitationContract.methods.getGamblingDappsList.call().call()

        let now = new Date().getTime() / 1000
        let block_num = await web3.eth.getBlockNumber()
        let block = await web3.eth.getBlock(block_num)
        let spent = BigInt(0);
        while(block.timestamp > now-period && block.number>10){
            for (let i = 0; i < block.transactions.length; i++) {
                let transaction = await web3.eth.getTransaction(block.transactions[i])
                if(transaction.from==player && gambling_sc_list.includes(transaction.to))
                    spent += BigInt(transaction.value)
            }
            block = await web3.eth.getBlock(block.number-1)
        }

        var spent_hash = keccak256(spent.toString()).toString('hex')
        var spent_bn = BigInt('0x' + spent_hash.substring(0,32));
        var res_str = (BigInt(currReq)*(BigInt(2)**BigInt(128)))+spent_bn

        console.log(`Request ${currReq} spent ${spent}`)

        saveOracleData(oid, currReq, spent)
        res.status(200).send(res_str.toString())
        
    }catch(error){
        console.log(error)
        res.status(200).send("0"); 
    }
}



module.exports = {
    getDataHash: getDataHash,
 }
