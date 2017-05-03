// file system access
var fs = require('fs');
// class that encapulates the account information
var AccountInfo = require('./AccountInfo');

function EthereumAccountStore() {
	this.userStore = {};
	this.addressToUserId = {};
	this.accountFolder = process.env.ACCOUNT_FOLDER;
}

EthereumAccountStore.prototype.storeLoadedAccountInfoInMemory = function(accountInfo) {
	var userId = accountInfo.userId;
	var accountAdr = accountInfo.accountAdr;
	this.addressToUserId[accountAdr] = userId;
	this.userStore[userId] = accountInfo;
}

EthereumAccountStore.prototype.storeAccountInfoInMemory = function(userId, userName, accountAdr, accountPwd) {
	var curAccountInfo = new AccountInfo(userId, userName, accountAdr, accountPwd);
	this.addressToUserId[accountAdr] = userId;
	this.userStore[userId] = curAccountInfo;
}

EthereumAccountStore.prototype.getAccountInfoByUserId = function(userId) {
	return this.userStore[userId];
}

EthereumAccountStore.prototype.getAddressToUserIdMap = function() {
	return this.addressToUserId;
}


EthereumAccountStore.prototype.storeAccountInfoInFileSystem = function(userId, userName, accountAdr, accountPwd) {
  console.log("account log path: " + this.accountFolder + 'accounts.log');
  var curAccountInfo = new AccountInfo(userId, userName, accountAdr, accountPwd);
  fs.appendFileSync(this.accountFolder + 'accounts.log', JSON.stringify(curAccountInfo) + '\n\n');
}

EthereumAccountStore.prototype.loadAccountInfoInFromSystem = function() {
  	console.log("account log path: " + this.accountFolder + 'accounts.log');

  	var inFile = this.accountFolder + 'accounts.log';
	var lineReader = require('readline').createInterface({
	  input: require('fs').createReadStream(inFile)
	});

	var self = this;

	lineReader.on('line', function (line) {
		if (line.length > 3) {
		  	try {
		  		var loadedAccount = JSON.parse(line);
		  		console.log('Loaded Account: ' + loadedAccount);
		  		// check if the account was loaded properly!
		  		if (loadedAccount.userId == undefined 
		  			|| loadedAccount.accountAdr == undefined 
		  			|| loadedAccount.accountPwd == undefined) {
		  			throw "Could not load user account properly, could not read userID!";
		  		}
		  		self.storeLoadedAccountInfoInMemory(loadedAccount);
		  	} catch(err) {
		  		console.log(err);
		  	}
		 }
	});
  
}


module.exports = EthereumAccountStore;