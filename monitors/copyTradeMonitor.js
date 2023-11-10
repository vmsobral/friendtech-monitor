const ethers = require('ethers')
const { contract } = require('./friendtechContract')
const tradersWallets = require('./copyTradeWallets.json')

const PORTFOLIO = {
  portfolioValue: ethers.parseEther('0.1'), //TODO: get portfolio value at runtime
  buys: 0,
  sales: 0,
  openTrades: 0,
  successfulTrades: 0,
  lostTrades: 0,
}

let monitoredTrades = []

const monitor = async (trader, subject, isBuy, shareAmount, ethAmount, protocolEthAmount, subjectEthAmount, supply, logger) => {
  const isMonitoredWallet = tradersWallets.find((elem) => elem.wallet === trader)
  const isMonitoredTrade = monitoredTrades.find((elem) => elem.subject === subject)

  let triggetSale = false

  if (isMonitoredWallet) {
    logger.info(`${isMonitoredWallet.name} made a trade. Operation = ${isBuy ? "Buy" : "Sale"}`)

    if (isBuy) { //purchase
      if (shareAmount > 2) {
        logger.info('Too many shares bought, ignoring')
        return false
      }

      const buyPriceAfterFee = await contract.getBuyPriceAfterFee(subject, shareAmount)
      if (buyPriceAfterFee > ethers.parseEther('0.02')) {
        logger.info('Price too high, ignoring')
        return false
      }

      if (isMonitoredTrade) {
        logger.info('Ticket already bought, ignoring')
        return false
      }
      
      logger.info(`Buy price inside buy range at ${ethers.formatEther(buyPriceAfterFee)}. Buy 1 share of ${subject}`)
      managePurchase(subject, 1, buyPriceAfterFee, logger)
    }

    if(!isBuy) { //sale
      const sellPriceAfterFee = await contract.getSellPriceAfterFee(subject, 1)
      if (sharesBalance === 0) {
        logger.info(`${isMonitoredWallet.name} sold all of his shares, selling as well at ${ethers.formatEther(sellPriceAfterFee)}`)
        triggetSale = true
      }

      const stopLoss = isMonitoredTrade.buyPrice * 0.8
      if (sellPriceAfterFee <= stopLoss) {
        console.log(`Stop loss triggered, selling at ${ethers.formatEther(sellPriceAfterFee)}.`)
        triggetSale = true
      }
    }
  }

  if (isMonitoredTrade) {
    logger.info(`Monitored subject ${subject} traded. Operation = ${isBuy ? "Buy" : "Sale"}`)
   
    const sellPriceAfterFee = await contract.getSellPriceAfterFee(subject, 1)
    const stopLoss = monitoredSubject.buyPrice * 0.8
    if (sellPriceAfterFee <= stopLoss) {
      console.log(`Stop loss triggered, selling at ${ethers.formatEther(sellPriceAfterFee)}.`)
      triggetSale = true
    }

    const targetPrice = monitoredSubject.buyPrice * 2
    if (sellPriceAfterFee > targetPrice) {
      console.log(`Target price triggered, selling at ${ethers.formatEther(sellPriceAfterFee)}.`)
      triggetSale = true
    }
  }

  if (triggetSale) manageSale(subject, 1, sellPriceAfterFee, logger)
}

const managePurchase = (subject, shareAmount, buyPriceAfterFee, logger) => {
  //buy first
  monitoredTrades.push({
    subject: subject,
    buyPrice: buyPriceAfterFee,
    totalShares: shareAmount
  })

  PORTFOLIO.openTrades++
  PORTFOLIO.buys++
  PORTFOLIO.portfolioValue -= buyPriceAfterFee

  printPortfolio(logger)
}

const manageSale = (subject, shareAmount, sellPriceAfterFee, logger) => {
  //sell first
  const finishedTrade = monitoredTrades.find((elem) => elem.subject = subject)
  const index = monitoredTrades.indexOf(finishedTrade)
  monitoredTrades.splice(index)

  PORTFOLIO.openTrades--
  PORTFOLIO.sales++
  PORTFOLIO.portfolioValue += sellPriceAfterFee

  if (finishedTrade.buyPrice < sellPriceAfterFee) PORTFOLIO.successfulTrades++
  if (finishedTrade.buyPrice >= sellPriceAfterFee) PORTFOLIO.lostTrades++

  printPortfolio(logger)
}

const printPortfolio = (logger) => {
  logger.info(```Portfolio:
    portfolioValue: ${PORTFOLIO.portfolioValue},
    buys: ${PORTFOLIO.buys},
    sales: ${PORTFOLIO.sales},
    openTrades: ${PORTFOLIO.openTrades},
    successfulTrades: ${PORTFOLIO.successfulTrades},
    lostTrades: ${PORTFOLIO.lostTrades},
  ```)
}