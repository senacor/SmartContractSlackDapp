const config = require('config')

// setup web3 API to communicate with Ethereum client
const Web3 = require('web3')
const web3 = new Web3()
// configure web3
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

const adminAccountAddress = config.admin.account.address
const adminAccountPwd = config.admin.account.password
const adminUserId = config.admin.userid

const initialMoneyAmount = parseInt(config.init.account.money)
const minParticipationAmount = parseInt(initialMoneyAmount / 2, 10)

const contractABI = config.get('contractAbi')

// init the election contract
// init the election contract
const lotteryContract = web3.eth.contract(contractABI)
let lotteryContractAdr = config.contract.address
let lottery = null

// var addressToUserId = {};

// var userRegistrationEvent

// electionInst = election.at(process.env.CONTRACT_ADR);

function EthereumLotteryAdapter() {
  // console.log(minParticipationAmount);
  // console.log(initialMoneyAmount);

  if (lotteryContractAdr !== undefined) {
    lottery = lotteryContract.at(lotteryContractAdr)
  }

  // initContractEvents();
}

/* var initContractEvents() {

 userRegistrationEvent = myContractInstance.UserRegistrationEvent(function(error, result){
 if (error) {
 console.log(error);
 return;
 }

 var address = result.user;
 var userId = addressToUserId[address];

 });

 } */

const checkLotteryInitialized = function (userNotify) {
  if (lottery === undefined || lottery === null) {
    userNotify.notifyUser("LOTTERY NOT DEFINED! Admin has to call 'set lottery {LOTTERY_CONTRACT_ADDRESS}' command")
    throw new Error('Waiting for admin to set lottery...')
  }
}

const checkAdmin = function (userNotify) {
  const userId = userNotify.userId
  if (userId !== adminUserId) {
    userNotify.notifyUser(`You have to be admin to execute the ${userNotify.command} command`)
    throw new Error(`You have to be admin to execute the ${userNotify.command} command`)
  }
}

const checkSufficientFunds = function (adr, atLeastAmount, userNotify) {
  const balance = web3.eth.getBalance(adr)

  if (parseInt(balance) < atLeastAmount) {
    if (userNotify !== undefined) {
      userNotify.notifyUser(`You don't have enough funds to ${userNotify.command}. You need at least ${web3.fromWei(minParticipationAmount)} Ether`)
    }
    throw new Error('Insufficient funds to do transaction!')
  }
}

/* var convertWeiToEther = function (weiAmount) {
 return web3.fromWei(parseInt(weiAmount))
 } */

/* var getAccountBalance = function (userInfo) {
 return web3.eth.getBalance(userInfo.accountAdr)
 } */

EthereumLotteryAdapter.prototype.setLotteryAddress = function (_lotteryAddress, userNotify) {
  lotteryContractAdr = _lotteryAddress

  try {
    lottery = lotteryContract.at(lotteryContractAdr)
  } catch (err) {
    console.log(err)
    throw new Error(`failed initializing the new lottery address: ${_lotteryAddress}`)
  }

  userNotify.notifyUser('')
}

EthereumLotteryAdapter.prototype.getLotteryAddress = function () {
  return lotteryContractAdr
}

// NOT IMPLEMENTED YET, lottery contract creation has to be done by hand at the moment!
EthereumLotteryAdapter.prototype.newLottery = function (userNotify) {
  checkLotteryInitialized(userNotify)
  checkAdmin(userNotify)

  throw new Error(`<@${userNotify.userId}>: NOT IMPLEMENTED YET: Creating a new lottery is not implemented at the moment!
  You have to deploy by hand through the ethereum client!`)
}

EthereumLotteryAdapter.prototype.resetLottery = function (minParticipationAmount, initialMoneyAmount, userNotify) {
  checkLotteryInitialized(userNotify)
  checkAdmin(userNotify)

  unlockEthereumAccount(adminAccountAddress, adminAccountPwd, 1200)
  const transNo = lottery.resetLottery.sendTransaction(minParticipationAmount, {
    from: adminAccountAddress,
    value: initialMoneyAmount
  })
  userNotify.notifyUser(`Lottery reset, transaction number: ${transNo}`)
}

EthereumLotteryAdapter.prototype.placeBets = function (userNotify) {
  checkLotteryInitialized(userNotify)

  const userAccount = userNotify.accountInfo
  checkSufficientFunds(userAccount.accountAdr, minParticipationAmount + 20000, userNotify)

  unlockEthereumAccount(userAccount.accountAdr, userAccount.accountPwd, 1200)
  const transNo = lottery.placeBets.sendTransaction(0, {from: userAccount.accountAdr, value: minParticipationAmount})
  // remember the address
  userNotify.addressToUserId[userAccount.accountAdr] = userAccount.userId
  userNotify.notifyUser(`The transaction to place your bets was initiated, transaction number: ${transNo}`)
}

EthereumLotteryAdapter.prototype.endLottery = function (userNotify) {
  checkLotteryInitialized(userNotify)
  checkAdmin(userNotify)

  unlockEthereumAccount(adminAccountAddress, adminAccountPwd, 1200)
  const transNo = lottery.endLottery.sendTransaction(0, {from: adminAccountAddress})
  userNotify.notifyUser(`GOOD NEWS EVERYONE! The transaction to end the lottery and determine the winner was initiated, transaction number: ${transNo}`,
    'no_user')
}

EthereumLotteryAdapter.prototype.transferPotToWinner = function (userNotify) {
  checkLotteryInitialized(userNotify)

  const winner = lottery.getWinner.call()
  const winnerUserId = userNotify.addressToUserId[winner]

  if (winnerUserId !== userNotify.userId) {
    userNotify.notifyUser('Eeeey, you are not the winner, no money for you!')
    return
  }

  const userAccount = userNotify.accountInfo
  unlockEthereumAccount(userAccount.accountAdr, userAccount.accountPwd, 1200)
//  var transNo = lottery.transferPotToWinner.sendTransaction(0, {from: userAccount.accountAdr})
  userNotify.notifyUser('The winner took the funds! </lottery> ')
}

EthereumLotteryAdapter.prototype.getWinner = function (userNotify) {
  checkLotteryInitialized(userNotify)

  const winnerAdr = lottery.getWinner.call()
  console.log(`MAPPING: ${userNotify.addressToUserId}`)
  console.log(`WINNERADR: ${winnerAdr}`)

  const winnerUserId = userNotify.addressToUserId[winnerAdr]

  userNotify.notifyUser(`THE WINNER IS: <@${winnerUserId}>`, 'no_user')
  userNotify.notifyUser(`THE WINNER-ADDRESS IS: ${winnerAdr}`, 'no_user')
  userNotify.notifyUser('You transmit the winning-pot to your account by executing the "gimme my money" command!', winnerUserId)
  userNotify.notifyUser('Hey, its me again. Just wanted to tell you that "withdraw" also works, but I personally like "gimme my money" better.', winnerUserId)
}

EthereumLotteryAdapter.prototype.getPot = function (userNotify) {
  checkLotteryInitialized(userNotify)

  const currentPot = lottery.getPot.call()
  const currentPotInEther = web3.fromWei(currentPot)

  userNotify.notifyUser("The lottery's current pot is at: " + currentPotInEther + ' Ether')
}

EthereumLotteryAdapter.prototype.getParticipants = function (userNotify) {
  checkLotteryInitialized(userNotify)

  const participants = lottery.getParticipants.call()
  userNotify.notifyUser(`Participant addresses: [${participants}]`, 'no_user')

  const participantsArr = participants // JSON.parse(participants);

  // var message = 'Slack user that participated: ';
  for (let i = 0; i < participantsArr.length; i++) {
    const address = participantsArr[i]

    if (userNotify.addressToUserId[address] === undefined) {
      userNotify.notifyUser(`[no user defined for address ${address}]`, 'no_user')
    } else {
      userNotify.notifyUser(`<@${userNotify.addressToUserId[address]}>`, 'no_user')
    }
  }

  // userNotify.notifyUser(message);
}

const unlockEthereumAccount = function (adr, pwd, timeInSeconds) {
  return web3.personal.unlockAccount(adr, pwd, timeInSeconds)
}

module.exports = EthereumLotteryAdapter
