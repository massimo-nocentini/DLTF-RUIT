const {LinkToken}  = require('@chainlink/contracts/truffle/v0.4/LinkToken')

const LINK_ADDRESS = "0xB20031282bedadA606AC55F2904ff838337e5Ef9"
const ONE_LINK = "1000000000000000000"


module.exports = async function(callback) {
  try {
    LinkToken.setProvider(web3.currentProvider)
    const link = await LinkToken.at(LINK_ADDRESS)

    switch(process.argv[6]){
        case "help":
            console.log("Account balance: truffle exec scripts/manage_link.js --network ganache balance address\nFund LINK: truffle exec scripts/manage_link.js --network ganache fund source_address destination_address")
            break;
        case "balance":
            if(process.argv[7]==undefined){
                console.log("Error: provide the address")
                return
            }

            const account = process.argv[7]
            var balance_eth = await web3.eth.getBalance(account)
            balance_eth =  web3.utils.fromWei(balance_eth, 'ether');
            var balance_link = await link.balanceOf(account);
            balance_link = BigInt(balance_link)

            console.log("Balance of:",account)
            console.log("ETH:",balance_eth)
            console.log("LINK:",balance_link)
            break;
        case "fund":
            if(process.argv[7]==undefined || process.argv[8]==undefined){
                console.log("Error: provide the source and destination address")
                return
            }

            const from = process.argv[7]
            const to = process.argv[8]
            const tx = await link.transfer(to, ONE_LINK, {from: from})
            console.log("Fund completed!")
            break;
        default:
            console.log("Invalid arguments",process.argv[6])
    }

  }
  catch(error) {
    console.log(error)
  }

  callback()
}