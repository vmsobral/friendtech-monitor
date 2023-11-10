const axios = require('axios')
const { provider } = require('../friendtechContract')
const { ethers } = require("ethers")
const retry = require('async-await-retry');

const monitor = async (logger, tradeInfo) => {
    const { trader, subject, isBuy, shareAmount, ethAmount, protocolEthAmount, subjectEthAmount, supply } = tradeInfo

    const isNewUser = trader === subject && isBuy && ethAmount == 0 && shareAmount === 1n && supply === 1n
    if (isNewUser) {
      const subjectBalance = await provider.getBalance(subject);

      // Balance too low
      if (subjectBalance < ethers.parseEther('0.01')) return false

      let twitterUsername//, twitterId
      try {
        const friendTechInfoResponse = await retry(async () => axios.get(`https://prod-api.kosetto.com/users/${trader}`), null, {retriesMax: 4, interval: 500})
        twitterUsername = friendTechInfoResponse.data.twitterUsername
        // twitterId = friendTechInfoResponse.data.twitterUserId
      } catch (e) {
        logger.warn('Couldnt find twitter handler')
        twitterUsername = 'Not Found'
      }

      // try {
      //   const twitterInfoResponse = await retry(async () => axios.get(`https://api.twitter.com/1.1/followers/ids.json?${twitterId}`), null, {retriesMax: 4, interval: 500})
      //   console.log(twitterInfoResponse.data)
      // } catch (e) {
      //   logger.warn('Couldnt find twitter info')
      // }

      logger.info(`New User: ${trader} ; balance: ${ethers.formatEther(subjectBalance)} ; twitter: ${twitterUsername}` )
    }
}

module.exports = {
    monitor
}