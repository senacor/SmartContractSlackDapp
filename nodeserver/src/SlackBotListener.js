// define slackclient
const RtmClient = require('@slack/client').RtmClient
const MessageProcessor = require('./SlackMessageProcessor')
const UserNotificationHandler = require('./UserNotificationHandler')

// reading functions from slack
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS
// var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM
const RTM_EVENTS = require('@slack/client').RTM_EVENTS
// define slackclient memory database
const MemoryDataStore = require('@slack/client').MemoryDataStore

const config = require('config')

// bot token
const botToken = config.slack.bot.token
// bot name
const botName = config.slack.bot.name

let me = null

const slack = new RtmClient(botToken, {
  logLevel: 'error',
// initialize Datastore ???
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: true
})

const messageProcessorInst = new MessageProcessor(slack)

slack.start()

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the 'rtm.start' payload if you want to cache it
slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log('Logged in, but not yet connected to a channel')
  for (let userId in slack.dataStore.users) {
    const user = slack.dataStore.users[userId]
    if (user.name === botName) {
      me = user
      break
    }
  }
})

slack.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  try {
    const userNotify = new UserNotificationHandler()
    userNotify.setSlackClient(slack)
    userNotify.setChannel(message.channel)
    userNotify.setUserIdAndEmail(message.user)

    if (me !== null) {
      if ((message.text) && (message.text.indexOf(me.id) >= 0)) {
        console.log('Incoming message')
        messageProcessorInst.processSlackBotMessage(message, userNotify)
      }
    }
    if (message.subtype && message.subtype === 'channel_join') {
      // slack.sendMessage('<@'+ message.user +'>, please execute the  ', message.channel);
    }
    console.log(`Message: ${message}`)
    console.log(`  >>UserId: ${message.user}`)
    console.log(`  >>UserName: §{slack.dataStore.users[message.user].profile.first_name} ${slack.dataStore.users[message.user].profile.last_name}`)
    console.log(`  >>UserEmail: ${slack.dataStore.users[message.user].profile.email}`)
  } catch (err) {
    console.log(`ERROR: ${err}`)
  }
})
