// setup web3 API to communicate with Ethereum client
var Web3 = require('./node_modules/web3');
var web3 = new Web3();
//configure web3
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// file system access
var fs = require('fs');

// setup direct RPC, to be able to call the Ethereum client's personal.newAccount([pwd]) function
var rpc = require('json-rpc2');
var rpcClient = rpc.Client.$create(8545, "localhost");

var EthereumAccountStore = require('./EthereumAccountStore');
var EthereumAccountPublisher = require('./EthereumAccountPublisher');

var initialMoneyAmount = parseInt(process.env.INIT_ACCOUNT_MONEY);
var adminAccountAddress = process.env.ADMIN_ACCOUNT_ADR;
var adminAccountPwd = process.env.ADMIN_ACCOUNT_PWD;
var accountFolder = process.env.ACCOUNT_FOLDER;

var accountStore = new EthereumAccountStore();
var accountPublisher = new EthereumAccountPublisher();

function EthereumAccountAdapter() {

  // run check if the enviroment variables are checked
  if (initialMoneyAmount === undefined
    || adminAccountAddress === undefined
    || adminAccountPwd === undefined
    || accountFolder === undefined) {
    console.log('## FATAL ERROR: Environment variable of EthereumAccountAdapter not set! Check the variables! ##');
  throw "## FATAL ERROR: Environment variable of EthereumAccountAdapter not set! Check the variables! ##"
}
}

/*
 * creates new account and returns the account information.
 */
 EthereumAccountAdapter.prototype.createNewAccount = function (userNotify) {
  if (this.getAccountInfoByUserId(userNotify.userId) != undefined) {
    userNotify.notifyUser("You are already registered! What are you trying to pull?");
    return;
  }

  newEthereumAccount(userNotify);
};

EthereumAccountAdapter.prototype.getAccountInfoByUserId = function (userId) {
  return accountStore.getAccountInfoByUserId(userId);
}

EthereumAccountAdapter.prototype.loadAccounts = function () {
  accountStore.loadAccountInfoInFromSystem();
}

EthereumAccountAdapter.prototype.getAddressToUserIdMap = function () {
  return accountStore.addressToUserId;
}

EthereumAccountAdapter.prototype.getAccountBalanceInEtherByUserId = function (userId) {
  var accountInfo = this.getAccountInfoByUserId(userId);
  if (accountInfo === undefined) {
    return undefined;
  }

  var accountAdr = accountInfo.accountAdr;

  if (accountAdr === undefined) {
    return undefined;
  }

  try {
    var accountBalance = web3.fromWei(web3.eth.getBalance(accountAdr));
    return accountBalance;
  } catch (err) {
    return err;
  }
}

EthereumAccountAdapter.prototype.getAdminBalanceInEther = function () {
  return web3.fromWei(web3.eth.getBalance(adminAccountAddress));
}

var generatePassword = function () {
  return Math.random().toString(36).slice(-8);
  ;
}

var newEthereumAccount = function (_userNotify) {
  var pwdNewAccount = generatePassword();
  var userNotify = _userNotify;

  rpcClient.call("personal_newAccount", [pwdNewAccount], function (err, result) {
    try {
      if (err != null) {
        console.log('ERROR', err);
        throw "Ethereum account creation failed, there was a problem with the Ethereum client.";
      }

      var accountAdr = result;
      var userId = userNotify.userId;
      var userEmail = userNotify.userEmail;
      userNotify.notifyUser("Ethereum account created!");

      console.log('Account created', accountAdr);

      //transact money to account
      unlockEthereumAccount(adminAccountAddress, adminAccountPwd, 1200);
      web3.eth.sendTransaction({from: adminAccountAddress, to: accountAdr, value: initialMoneyAmount, gas: 4000000});

      // remember account information
      accountStore.storeAccountInfoInMemory(userId, "Anonymous", accountAdr, pwdNewAccount);
      accountStore.storeAccountInfoInFileSystem(userId, "Anonymous", accountAdr, pwdNewAccount);

      // send newly created account to the user via email (saver than via slack...)
      accountPublisher.publishAccountViaEmail(userEmail, accountAdr, pwdNewAccount);
      userNotify.notifyUser("The ethereum account was sent to you via email.");
    } catch (err) {
      userNotify.notifyUser("Problem during ethereum account creation: " + err);
    }

  });
}

var unlockEthereumAccount = function (accountNr, passphrase, timeInSeconds) {
  return web3.personal.unlockAccount(accountNr, passphrase, timeInSeconds);
}


/**
 goes through all of the accounts that are known to the ethereum client and
 checks if there is any ether on them. if no ethere is found then the account-file
 will be delete.
 Note: This was written for testing the application (if the money transaction failes the account is worthless...).
 This function DOES NOT alter the account store information; if an account creation fails during the server is running
 the user can currently not reset his account!
 **/
 EthereumAccountAdapter.prototype.cleanup = function (removeMinAccounts, userNotify) {

  if (!accountFolder.endsWith('/')) {
    accountFolder += '/';
  }

  files = fs.readdirSync(accountFolder);

  files.forEach(function (file) {
    console.log('account file: ', file);

    web3.eth.accounts.forEach(function (accountNr) {

      if (accountNr != null && file.indexOf(accountNr.substring(2, accountNr.length)) >= 0) {
        var accountBalance = web3.eth.getBalance(accountNr);

        if (accountBalance == 0 || (removeMinAccounts && accountBalance == parseInt(process.env.INIT_ACCOUNT_MONEY))) {
          console.log("delete empty account: " + accountFolder + file);
          fs.unlinkSync(accountFolder + file);
        }
      }
    });
  });

  userNotify.notifyUser('Accounts cleaned up!');
}

module.exports = EthereumAccountAdapter;
