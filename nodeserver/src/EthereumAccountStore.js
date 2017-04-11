const config = require('config')

// file system access
const fs = require('fs')
// class that encapulates the account information
const AccountInfo = require('./AccountInfo')

function EthereumAccountStore() {
  this.userStore = {}
  this.addressToUserId = {}
  this.accountFolder = config.account.folder
}

EthereumAccountStore.prototype.storeLoadedAccountInfoInMemory = function (accountInfo) {
  const userId = accountInfo.userId
  const accountAdr = accountInfo.accountAdr
  this.addressToUserId[accountAdr] = userId
  this.userStore[userId] = accountInfo
}

EthereumAccountStore.prototype.storeAccountInfoInMemory = function (userId, userName, accountAdr, accountPwd) {
  const curAccountInfo = new AccountInfo(userId, userName, accountAdr, accountPwd)
  this.addressToUserId[accountAdr] = userId
  this.userStore[userId] = curAccountInfo
}

EthereumAccountStore.prototype.getAccountInfoByUserId = function (userId) {
  return this.userStore[userId]
}

EthereumAccountStore.prototype.getAddressToUserIdMap = function () {
  return this.addressToUserId
}

EthereumAccountStore.prototype.storeAccountInfoInFileSystem = function (userId, userName, accountAdr, accountPwd) {
  console.log(`account log path: ${this.accountFolder} accounts.log`)
  const curAccountInfo = new AccountInfo(userId, userName, accountAdr, accountPwd)
  fs.appendFileSync(this.accountFolder + 'accounts.log', JSON.stringify(curAccountInfo) + '\n\n')
}

EthereumAccountStore.prototype.loadAccountInfoInFromSystem = function () {
  console.log(`account log path: ${this.accountFolder} accounts.log`)

  const inFile = this.accountFolder + 'accounts.log'
  const lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(inFile)
  })

  const self = this

  lineReader.on('line', function (line) {
    console.log('Line from file:', line)
    if (line.length > 3) {
      try {
        const loadedAccount = JSON.parse(line)
        console.log(`Loaded Account: ${loadedAccount}`)
        // check if the account was loaded properly!
        if (loadedAccount.userId === undefined ||
          loadedAccount.accountAdr === undefined ||
          loadedAccount.accountPwd === undefined) {
          throw new Error('Could not load user account properly, could not read userID!')
        }
        self.storeLoadedAccountInfoInMemory(loadedAccount)
      } catch (err) {
        console.log(err)
      }
    }
  })
}

module.exports = EthereumAccountStore
