function UserNotificationHandler() {
}

UserNotificationHandler.prototype.setAddressToUserIdMap = function(_addressToUserIdMap) {
	this.addressToUserId = _addressToUserIdMap;
};

UserNotificationHandler.prototype.setSlackClient = function(_slack) {
	this.slack = _slack;
};

// TODO: One should make the channel thing more intelligent; a message that triggers something should
// 		be traceable back to user and channel. For the moment we just assume that there is only one channel.
UserNotificationHandler.prototype.setChannel = function(_channel) {
	this.channel = _channel;
};

UserNotificationHandler.prototype.setUserIdAndEmail = function(_userId) {
	this.userId = _userId;
	this.userEmail = this.slack.dataStore.users[_userId].profile.email;
};

UserNotificationHandler.prototype.setAccountInfo = function(_accountInfo) {
	this.accountInfo = _accountInfo;
};

UserNotificationHandler.prototype.setCommand = function(_command) {
	this.command = _command;
};

UserNotificationHandler.prototype.setCommandParams = function(_commandParams) {
	this.commandParams = _commandParams;
};

// _message obligatory, _userId and _channel optional
UserNotificationHandler.prototype.notifyUser = function(_message, _userId, _channel) {

	var userchannel = this.channel;
	if (_channel !== undefined && _channel != null) {
		userchannel = _channel;
	}

	var message;

	if (_userId == 'no_user') {
		message = _message;
	}
	else if (_userId !== undefined || _userId != null) {
		message = '<@'+ _userId +'>: ' + _message;
	}
	else if (this.userId !== undefined && this.userId != null) {
		message = '<@'+ this.userId +'>: ' + _message;
	} else {
		message = _message;
	}

	var userchannelid = this.slack.dataStore.getChannelGroupOrDMById(userchannel).id;
	this.slack.sendMessage(message, userchannelid);

};

module.exports = UserNotificationHandler;
