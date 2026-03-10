const manager = artifacts.require('RequestManager')
const ocr = artifacts.require("OffchainAggregator")
const ac = artifacts.require("AccessController")
const betDapp = artifacts.require('Gambling')
const Operator = artifacts.require('Operator')
const DepositLimitation = artifacts.require('DepositSelfLimitation')
const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')


const OPERATOR_JOB = "0x142ff8885ecb4152a44969de0b419e9e00000000000000000000000000000000" //DR-SC job id
const DATA_FETCH_COST = "1000000000000000000" //Cost of a DR request
const LINK_ADDRESS = "0xf8066f5Daf76f4292d0b749E2d856228459AeDc4" // address of the contract maanging the LINK token
const ONE_LINK = "1000000000000000000"
const betDapps = ["0x08b32799ABCECE7709A53D87F8abb08BeCC38200","0x69287eC30F7477b3D07154cc3F7E1d8D5353dFa2","0x3B1D3b3a3127cFfC0025cc194f0BfF88fCcBa400"] //Addresses of known gambling dapps

//Oracles transmitting and signing addresses
const transmit_address = ["0x838aCD0f3Fbf6C5F4d994A6870a2a28afaC63F98","0x7E836AF68696ACe5509dC3B218081befcD6114B4","0x0041eB4b6818CECB501c5520f20e93163CC7F2b7","0x17b64dcE4ad70Ad4B69917Ba1C8E2448d891e5dF"]
const signing_address = ["0x3b9e47719194ccecc62e410fe5bbc82b4164d93d","0xebcdedae8fbc1e7c7150b43635b786ca05fd4cd0","0xc008ff257568383eaeadc6a601a9c35df9e0d027","0x662990260df2e3c63d99bf71032e03d3e3fe9a19"]
const threshold = 1
const encVersion = 1
// _encoded field generated with the encodeGenerator tool
const encoded = "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000006fc23ac0000000000000000000000000000000000000000000000000000000004a817c80000000000000000000000000000000000000000000000000000000004a817c80000000000000000000000000000000000000000000000000000000000773594000000000000000000000000000000000000000000000000007fffffffffffffff000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000002540be40000000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000003c000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000423c67cf4b3d9177855ed20f25b8a722790a597378c0925743693aa0a8e0a33b4e83c6f2e6a3eb7b2e58e2941b914ac2f04bd7dcd0e3c55ef28e500ddea678dd97882dffe9446b75a4321b27de15ad6cb0d100665088a34f67618356733f371ff986e9c5e47bf06da582da764eee651418dce12bd0b11e7b1616e791c0437511700000000000000000000000000000000000000000000000000000000000000d3313244334b6f6f574b736f52574767383846637234526d656676635451717357726a64424b53784864396735414e73324d5141432c313244334b6f6f574c634b36555475584453416454744677426b38397772535178397243793153716969487a6b516f586676376d2c313244334b6f6f5752656632765536616f4861475a725470716142476f5044767a526b656a37374361666e624a384261676763792c313244334b6f6f5747776d6f47535a6f73333269465a317658556875565173396e33526b526a67636a67444b7477747a4657664d000000000000000000000000004cae7354d9035322349e10f13a5040eba9137506ae9a270d8c46096009d62029ff71ced3caa46c8df470d6d893bdec615903f280ccdb36282b99f081c41306830000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000442ce1b231b1a441fbd58c17ddfb75f3b0000000000000000000000000000000032bfb9b48af2688d79ced3bb16b1e52500000000000000000000000000000000c6372741e726f0c456e0ce94bb996383000000000000000000000000000000000bb3134dacd34b485da990d9a07c253100000000000000000000000000000000"
const maxReqTime = 120
const LINKperWei = 190

// OCR-SC constructor parameters
const ocr_conf = {
  "decimals": 5,
  "maximumGasPrice": 3000,
  "reasonableGasPrice": 100,
  "microLinkPerEth": 128900000,
  "linkGweiPerObservation": 2000000000,
  "linkGweiPerTransmission": 100000000,
  "minAnswer": 0,
  "maxAnswer": 10,
  "description": "OCR test"

}

module.exports = async (deployer, network, [defaultAccount]) => {
  console.log(network)
  try {
    manager.setProvider(deployer.provider)
    ocr.setProvider(deployer.provider)
    ac.setProvider(deployer.provider)
    betDapp.setProvider(deployer.provider)
    LinkToken.setProvider(deployer.provider)
    Operator.setProvider(deployer.provider)
    DepositLimitation.setProvider(deployer.provider)

    var link_cnt = await LinkToken.at(LINK_ADDRESS)

    var dr_dep = await deployer.deploy(Operator, LINK_ADDRESS, defaultAccount, { from: defaultAccount })
    var operator_cnt = await Operator.deployed()
    var fun1 = await operator_cnt.setAuthorizedSenders(transmit_address ,{from: defaultAccount})

    var reqmanager_dep = await deployer.deploy(manager, DATA_FETCH_COST, operator_cnt.address, OPERATOR_JOB, LINK_ADDRESS,  { from: defaultAccount })
    var manager_cnt = await manager.deployed()
    
    await deployer.deploy(ac, { from: defaultAccount })
    var ac_cnt = await ac.deployed()

    var fun2 = await ac_cnt.addAccess(manager_cnt.address, { from: defaultAccount })
    var fun3 = await ac_cnt.addAccess(defaultAccount, { from: defaultAccount })

    var deposit_dep = await deployer.deploy(DepositLimitation, { from: defaultAccount })
    var depositLimitation_cnt = await DepositLimitation.deployed()
    var fun4 = await depositLimitation_cnt.setGamblingDapps(betDapps, { from: defaultAccount })

    var gambling_dep = await deployer.deploy(betDapp, manager_cnt.address, LINKperWei, LINK_ADDRESS, depositLimitation_cnt.address, { from: defaultAccount, value: 1000 })
    var betDapp_cnt = await betDapp.deployed()

    var ocr_dep = await deployer.deploy(ocr, ocr_conf["maximumGasPrice"],ocr_conf["reasonableGasPrice"],ocr_conf["microLinkPerEth"],
    ocr_conf["linkGweiPerObservation"],ocr_conf["linkGweiPerTransmission"],LINK_ADDRESS,ocr_conf["minAnswer"],
    ocr_conf["maxAnswer"],ac_cnt.address,ac_cnt.address,ocr_conf["decimals"],ocr_conf["description"], { from: defaultAccount })
    var ocr_cnt = await ocr.deployed()

    var fun5 = await ocr_cnt.setMaxrequestLinkTonken("15500000000000000000", { from: defaultAccount })
    var fun6 = await ocr_cnt.setPayees(transmit_address,transmit_address, { from: defaultAccount })
    var fun7 = await ocr_cnt.setConfig(signing_address,transmit_address,threshold,encVersion,encoded, { from: defaultAccount })
    var fun8 = await ocr_cnt.setRequestManager(manager_cnt.address, { from: defaultAccount })
    await depositLimitation_cnt.setMonthlySelfLimitation("10000000000000", { from: defaultAccount })


    var fun9 = await manager_cnt.setOCRcontract(ocr_cnt.address, { from: defaultAccount })
    var fun10 = await manager_cnt.setMaxReqTime(maxReqTime, { from: defaultAccount })
    var fun11 = await betDapp_cnt.approveLink("150000000000000000000", { from: defaultAccount })
    const link20 = BigInt(ONE_LINK)*BigInt(100) 
    await link_cnt.transfer(betDapp_cnt.address, link20.toString(), { from: defaultAccount })

    console.log("DepositLimitation: ",depositLimitation_cnt.address)
    console.log("Gambling         : ",betDapp_cnt.address)
    console.log("ReqManger        : ",manager_cnt.address)
    console.log("OCR              : ",ocr_cnt.address)
    console.log("DR address:      : ",operator_cnt.address)

    var reqManager_gas = parseInt((await web3.eth.getTransactionReceipt(reqmanager_dep.transactionHash)).gasUsed) + fun9.receipt.gasUsed + fun10.receipt.gasUsed
    var depositLimitation_gas = parseInt((await web3.eth.getTransactionReceipt(deposit_dep.transactionHash)).gasUsed) + fun4.receipt.gasUsed
    var gambling_gas = parseInt((await web3.eth.getTransactionReceipt(gambling_dep.transactionHash)).gasUsed) + fun11.receipt.gasUsed
    var dr_gas = parseInt((await web3.eth.getTransactionReceipt(dr_dep.transactionHash)).gasUsed) + fun1.receipt.gasUsed
    var ocr_gas = parseInt((await web3.eth.getTransactionReceipt(ocr_dep.transactionHash)).gasUsed) + fun5.receipt.gasUsed + fun6.receipt.gasUsed + fun7.receipt.gasUsed + fun8.receipt.gasUsed
    
    console.log("---------GAS ESTIMATION---------")
    console.log("DepositLimitation: ",depositLimitation_gas)
    console.log("Gambling         : ",gambling_gas)
    console.log("ReqManger        : ",reqManager_gas)
    console.log("OCR              : ",ocr_gas)
    console.log("DR address:      : ",dr_gas)

  } catch (err) {
    console.error(err)
  }
}
