var EthereumAccountAdapter = require('./EthereumAccountAdapter');
var EthereumLotteryAdapter = require('./EthereumLotteryAdapter');

var adminUserId = process.env.ADMIN_USERID;

var createAccountEnabled = false;

var swearArr = ['fuck', 'ass', 'ahole', 'stupid', 'hell', 'penis', 'suck', 'dick', 'shit', 'crap'];

// Constructor
function SlackMessageProcessor() {
	this.accountAdapter = new EthereumAccountAdapter();
  this.lotteryAdapter = new EthereumLotteryAdapter();
}

var isTextInMessage = function(text, message) {
	return message.indexOf(text) >= 0;
};

var extracMessageWithoutUser = function(message) {
  var rawText = message.text;
  return rawText.substring(rawText.indexOf('>') + 1, rawText.length).trim().toLowerCase()
};

var processMessage = function (message) {
	var messageInfo = {};
  var noUserText = extracMessageWithoutUser(message);

  var text = noUserText;
  var parameters;

  // extract parameters
  if (isTextInMessage('{', noUserText)
    && isTextInMessage('}', noUserText)) {
    text = noUserText.substring(0, noUserText.indexOf('{')).trim();
    parameters = noUserText.substring(noUserText.indexOf('{') + 1, noUserText.indexOf('}')).trim().split(',');
  }

  messageInfo.text = text;
  messageInfo.params = parameters;

	return messageInfo;
};

var checkAccountInfo = function(userNotify) {
  if (userNotify.accountInfo === undefined) {
    userNotify.notifyUser('You are not registered yet! You have to run "create account" command before you can run "' + userCommand +'".');
    return false;
  }
  return true;
};

var checkAdmin = function(userNotify) {
  if (userNotify.userId != adminUserId) {
      var command = userNotify.command;
      userNotify.notifyUser("The command '" + command + "' can only be executed by the admin!");
      return false;
  }
  return true;
};

var checkForSwearing = function(mText, userNotify) {
  for (var i = 0; i < swearArr.length; i++) {
    if (isTextInMessage(swearArr[i], mText)) {
      userNotify.notifyUser('Stop swearing or I will tell your mom!');
    }
  }
};

var checkParams = function(userNotify, count) {
  var paramArr = userNotify.commandParams;
  if (paramArr.length != count) {
    userNotify.notifyUser('Only exactly' + count + ' parameters allowed for ' + command);
    return false;
  }
  return true;
};

SlackMessageProcessor.prototype.processSlackBotMessage = function (message, userNotify) {

  var userId = userNotify.userId;

  var procMessage = processMessage(message);
  var mText = procMessage.text;
  var mParams = procMessage.params;

  // store the command and the parameters in the notification object
  userNotify.setCommand(mText);
  userNotify.setCommandParams(mParams);

  var accountInfo = this.accountAdapter.getAccountInfoByUserId(userId);

  // if user informaiton is available store it in the notification object
  if (accountInfo !== undefined
    && accountInfo != null) {
    userNotify.setAccountInfo(accountInfo);
  }

  var addressToUserIdMap = this.accountAdapter.getAddressToUserIdMap();
  if (addressToUserIdMap !== undefined) {
    userNotify.setAddressToUserIdMap(addressToUserIdMap);
  }

  // check for known commands
  switch (mText) {
    case 'turn on create':
    case 'turn on create account':
      if (checkAdmin(userNotify)) {
        createAccountEnabled = true;
      }

      return;

    case 'create ethereum account':
  	case 'create new account':
    case 'create account':
    case 'new account':
      if (createAccountEnabled) {
  		  this.accountAdapter.createNewAccount(userNotify);
      }
      else {
        userNotify.notifyUser("Creating accounts is not enabled at the moment; the admin has to execute the 'turn on create' command.");
      }
  		return;

    case 'account info':
    case 'my account info':
    case 'my account':
    case 'account':
      if (checkAccountInfo(userNotify)) {
        userNotify.notifyUser('Your account address is: ' + accountInfo.accountAdr);
        // also print balance when checking account information
        var balance = this.accountAdapter.getAccountBalanceInEtherByUserId(userId);
        userNotify.notifyUser('Your account balance is: ' + balance + " Ether");
        //userNotify.notifyUser('Your password will not be printed, it is only available in the email that was sent to you.');
      }
      return;

    case 'admin balance':
      if (checkAdmin(userNotify)) {
        userNotify.notifyUser("The admin balance is: " + this.accountAdapter.getAdminBalanceInEther() + " Ether");
      }
      break;

    case 'my account balance':
    case 'my balance':
    case 'balance':
      var balance = this.accountAdapter.getAccountBalanceInEtherByUserId(userId);
      if (balance === undefined) {
        userNotify.notifyUser('It seems you are not registered yet! You have to run "create account" command before you can check your balance.');
        return;
      }
      userNotify.notifyUser('Your account balance is: ' + balance + " Ether");
      return;

    case 'cleanup empty accounts':
      if (checkAdmin(userNotify)) {
        this.accountAdapter.cleanup(false, userNotify);
      }
      return;

    case 'cleanup min accounts':
      if (checkAdmin(userNotify)) {
        this.accountAdapter.cleanup(true, userNotify);
      }
      return;

    case 'set lottery':
    case 'set lottery address':
    case 'init lottery':
    case 'init lottery address':
      if (checkAdmin(userNotify) &&
          checkParams(userNotify, 1)) {
        this.lotteryAdapter.setLotteryAddress(mParams[0], userNotify);
      }
      return;

    case 'reset':
    case 'reset lottery':
      if (checkAdmin(userNotify)
        && checkParams(userNotify, 2)) {

        var minAmount = mParams[0];
        var initAmount = mParams[1];

        this.lotteryAdapter.resetLottery(minAmount, initAmount, userNotify);
      }
      return;

    case 'current lottery':
    case 'current lotter address':
      userNotify.notifyUser("The current lottery is at: " + this.lotteryAdapter.getLotteryAddress());
      return;

    case 'play':
    case 'place bet':
  	case 'place bets':
    case 'place my bet':
    case 'place my bets':
  		this.lotteryAdapter.placeBets(userNotify);
  		return;

    case 'end lottery':
    case 'finish lottery':
      if (checkAdmin(userNotify)) {
        this.lotteryAdapter.endLottery(userNotify);
      }
      return;

    case 'who is the winner?':
    case 'who is the winner':
    case 'who won?':
    case 'who won':
  		this.lotteryAdapter.getWinner(userNotify);
  		return;

    case 'withdraw':
    case 'withdraw funds':
    case 'give me my money':
    case 'give me money':
    case 'gimme my money':
      this.lotteryAdapter.transferPotToWinner(userNotify);
      return;

    case 'participants':
    case 'who is in?':
    case 'who is in':
    case 'who joined?':
    case 'who joined':
      this.lotteryAdapter.getParticipants(userNotify);
      return;

    case 'pot':
    case 'current pot':
      this.lotteryAdapter.getPot(userNotify);
      return;

    case 'help':
      userNotify.notifyUser('Commands for players: ', 'no_user');
      userNotify.notifyUser('    create account', 'no_user');
      userNotify.notifyUser('    place bets', 'no_user');
      userNotify.notifyUser('    who joined?', 'no_user');
      userNotify.notifyUser('    who won?', 'no_user');
      userNotify.notifyUser('    current pot', 'no_user');
      userNotify.notifyUser('    balance', 'no_user');
      userNotify.notifyUser('    my account', 'no_user');
      return;

    case 'load accounts':
    case 'load account mapping':
      if (checkAdmin(userNotify)) {
        this.accountAdapter.loadAccounts();
        userNotify.notifyUser('loaded accounts into account store');
      }
      return;

  	default:
  		userNotify.notifyUser('Sorry, I did not understand you - are you sure you did not misspell?');

    // check if the user entered swear words (just for fun...)
    checkForSwearing(mText, userNotify);

  }
}; // process slack bot message

module.exports = SlackMessageProcessor;
