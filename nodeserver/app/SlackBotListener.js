// load config
require('dotenv').config()

//define slackclient
var RtmClient = require('@slack/client').RtmClient;
var MessageProcessor = require('./SlackMessageProcessor');
var UserNotificationHandler = require('./UserNotificationHandler');

//reading functions from slack
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
// define slackclient memory database
var MemoryDataStore = require('@slack/client').MemoryDataStore;

//bot token
var bot_token = process.env.SLACK_BOT_TOKEN;
//bot name
var bot_name = process.env.SLACK_BOT_NAME;

var me = null;

var slack = new RtmClient(bot_token, {
  logLevel: 'error',
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: true
});

var messageProcessorInst = new MessageProcessor(slack);

slack.start();

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the 'rtm.start' payload if you want to cache it
slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log('Connected to SlackBot, waiting for messages...');
  for (var user_id in slack.dataStore.users) {
    var user = slack.dataStore.users[user_id];
    if (user.name === bot_name) {
      me = user;
      break;
    }
  }
});

slack.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  try {

    var userNotify = new UserNotificationHandler();
    userNotify.setSlackClient(slack);
    userNotify.setChannel(message.channel);
    userNotify.setUserIdAndEmail(message.user);

    if (me !== null) {
      if ((message.text) && (message.text.indexOf(me.id) >= 0)) {
        console.log("Incoming message");
        messageProcessorInst.processSlackBotMessage(message, userNotify);
      }
    }
    
    console.log('Message:', message);
    console.log('  >>UserId:', message.user);
    console.log('  >>UserName: ', slack.dataStore.users[message.user].profile.first_name + ' ' + slack.dataStore.users[message.user].profile.last_name);
    console.log('  >>UserEmail: ', slack.dataStore.users[message.user].profile.email);
}
catch (err) {
  console.log("ERROR: ", err);
}

});



