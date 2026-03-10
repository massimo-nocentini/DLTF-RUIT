const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')

module.exports = async (deployer, network, [defaultAccount]) => {
  LinkToken.setProvider(deployer.provider)
  try {
    await deployer.deploy(LinkToken, { from: defaultAccount })
  } catch (err) {
    console.error(err)
  }
}
