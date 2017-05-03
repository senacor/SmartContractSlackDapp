// file system access
var fs = require('fs');

// init the email client
var SendEmail = require('./SendEmail');
var sendEmailInst = new SendEmail(process.env.EMAIL_ADR, process.env.EMAIL_PWD, process.env.EMAIL_UNAME);

var self;

function EthereumAccountPublisher() {
  this.accountFolder = process.env.ACCOUNT_FOLDER;
  this.adminEmailAdr = process.env.EMAIL_ADR;
  this.adminEmailPwd = process.env.EMAIL_PWD;
  this.contractAdr = process.env.CONTRACT_ADR;
  this.initialEthereAmount = parseInt(process.env.INIT_ACCOUNT_MONEY) / 1000000000000000000;
  this.networkID = process.env.NETWORK_ID;


  var contractAbiFilePath = process.env.CONTRACT_ABI_PATH;
  var contractAbiFile = process.env.CONTRACT_ABI_FILE;
  var contractDefinitionFile = JSON.parse(fs.readFileSync(contractAbiFilePath + contractAbiFile, 'utf8'));
  this.contractABI = JSON.stringify(contractDefinitionFile);

  self = this;
}

EthereumAccountPublisher.prototype.publishAccountViaEmail = function (userEmail, accountAdr, accountPwd) {

  switch (this.networkID) {
    case 'TESTNET' :
      sendEmailInst.send(userEmail,
        'Your Ethereum Account',
        'account address: ' + accountAdr +
        '\naccount password: ' + accountPwd +
        '\nthe small amount of ' + this.initialEthereAmount + ' ether was put on your account so you can send simple transactions.' +
        '\n\naccount keyfile data: \n' + retrieveKeyFileDataForAccount(accountAdr) + '\n\n' +
        'Instructions: \n' +
        '\t1. Download Ethereum Client (recommended: https://geth.ethereum.org/) \n' +
        '\t2. Start geth on test-net (geth --testnet console) and sync the blockchain. \n' +
        '\t3. Locate the keystore folder, where the account key files are stored. \n' +
        '\t\tWindows path (usually, with new ropsten network it may be different): %appdata%/Ethereum/testnet/keystore \n' +
        '\t4. Save the keyfile data into a file (any filename OK) and copy it into the keystore folder.\n' +
        '\t\t geth should immediately recognize the account. You can check that by typing web.eth.accounts in the geth console. \n' +
        '\t5. Read documentation: \n' +
        '\t\thttps://blog.ethereum.org/2016/11/20/from-morden-to-ropsten/ \n' +
        '\t\thttps://github.com/ethereum/go-ethereum/wiki/Command-Line-Options \n' +
        '\t\thttps://github.com/ethereum/go-ethereum/wiki/JavaScript-Console \n' +
        '\t\thttps://github.com/ethereum/wiki/wiki/JavaScript-API \n\n' +
        'in order to interact with the lottery contract you need the contract address and the contract interface: \n' +
        'contract address: ' + this.contractAdr +
        '\ncontract interface: \n' + this.contractABI
      );
      break;
    default:
      sendEmailInst.send(userEmail,
        'Your Ethereum Account',
        'account address: ' + accountAdr +
        '\naccount password: ' + accountPwd +
        '\nthe small amount of ' + this.initialEthereAmount + ' ether was put on your account so you can send simple transactions.' +
        '\n\naccount keyfile data: \n' + retrieveKeyFileDataForAccount(accountAdr) + '\n\n' +
        'Instructions: \n' +
        '\t1. Download Ethereum Client (recommended: https://geth.ethereum.org/) \n' +
        '\t2. Start geth (on the productive blockchain) and sync the blockchain. \n' +
        '\t3. Locate the keystore folder, where the account key files are stored. \n' +
        '\t\tWindows path (usually, with new ropsten network it may be different): %appdata%/Ethereum/keystore \n' +
        '\t4. Save the keyfile data into a file (any filename OK) and copy it into the keystore folder.\n' +
        '\t\t geth should immediately recognize the account. You can check that by typing web.eth.accounts in the geth console. \n' +
        '\t5. Read documentation: \n' +
        '\t\thttps://github.com/ethereum/go-ethereum/wiki/Command-Line-Options \n' +
        '\t\thttps://github.com/ethereum/go-ethereum/wiki/JavaScript-Console \n' +
        '\t\thttps://github.com/ethereum/wiki/wiki/JavaScript-API \n\n' +
        'in order to interact with the lottery contract you need the contract address and the contract interface: \n' +
        'contract address: ' + this.contractAdr +
        '\ncontract interface: \n' + this.contractABI
      );
  }
};


/**
 locates the key-file of the account and returns the file path.
 **/
var retrieveKeyFileForAccount = function (accountNr) {
  var files = fs.readdirSync(self.accountFolder);

  for (i = 0; i < files.length; i++) {
    var file = files[i];
    if (accountNr != null && file.indexOf(accountNr.substring(2, accountNr.length)) >= 0) {
      return self.accountFolder + '/' + file;
    }
  }
}

/**
 Returns the contenct of a keyfile, uses retrieveKeyFileForAccount(accountNr)
 **/
var retrieveKeyFileDataForAccount = function (accountNr) {
  var accountFilePath = retrieveKeyFileForAccount(accountNr);

  if (accountFilePath == null) {
    return;
  }
  var fileData = fs.readFileSync(accountFilePath, 'utf8')

  return fileData;
}


module.exports = EthereumAccountPublisher;
