const { contract } = require('./friendtechContract')

const monitors = [
  require('./monitors/newUserMonitor'),
  require('./monitors/copyTradeMonitor')
]

const start = async (logger) => {

  contract.on("Trade", async (trader, subject, isBuy, shareAmount, ethAmount, protocolEthAmount, subjectEthAmount, supply) => {
    const tradeInfo = {
      trader,
      subject,
      isBuy,
      shareAmount,
      ethAmount,
      protocolEthAmount,
      subjectEthAmount,
      supply
    }
    monitors.forEach((monitor) => {
      monitor.monitor(logger, tradeInfo)
    })
  })
}

module.exports = {
  start
}