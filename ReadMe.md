# Setup

### Requirements

1. Slack team + slack bot
2. NodeJs with the following packages: web3, nodemail, @slack/client, json-rpc2 (+ additional libraries for testing)
3. Ethereum Client + account with ether (testnet account OK)
4. Gmail account to send emails with newly created Ethereum account so slack team members

### Setup Slack

At this point it is assumed that you already have a slack team (otherwise: https://slack.com/create). You should create a bot user for the team (https://api.slack.com/bot-users). At the end of the setup-procedure for bot users you will receive a token and a bot name (you can chose the name). You will need the token and the name to pass them to the node server at startup.


### Setup Gmail Email

In order to send emails to your team members (the ethereum account details will be sent via email) you need a gmail account. We recommend that you create a new account for that purpose. You need the gmail email address and the password to startup the node server. Note that you can also change the nodemailer implementation to use any other email account than gmail. We just use gmail for now because its amongst the most simple accounts to add using nodemailer.

Important Note: Don't forget to activate the "allow unsecure apps" setting in the google account security setting. If you don't activate this nodemailer will not be able to send emails through the given gmail account.

### Setup Ethereum
You need some ethereum client. We used geth (go-Ethereum) for our setup. The following geth versions were used:

* 1.5.4 (stable)
* 1.5.7 (stable)

It is recommended that you sync and test with the testnet (as of 11/2017 the testnet is the ropsten-testnet) before you deploy anything to the productive chain.

Note that you need an "admin" account that holds the initial amount of ether that will be distributed to the accounts created for your users through slack-chat. You should be familiar with using Ethereum and the Ethereum client of your choice. We will define the commands for startup and RPC-API-exposure for geth. If you chose to use another client you will have to deal have to deal with the setup and startup by yourself.

For testing solidity-contracts you can used the following Ethereum test-frameworks:

* dapple (tests written in solidity)
* mocha + chaithereum (tests written in javascript running through web3)

We used dapple to test our contracts (see the _test files in the contract directory).

### Setup nodejs

You just need nodejs  in a version >6.
The setup was tested with node:

* v6.9.1 on Windows
* v7.2.0 on Linux (Ubuntu)


# Run the program


### Startup Ethereum Client

#### TESTNET (Ropsten test chain)

start geth like this:
		
	geth --datadir [YOUR-FILE-PATH] init genesis.json; 
	geth --datadir [YOUR-FILE-PATH] --networkid 3 console

More details on ropsten setup here: https://blog.ethereum.org/2016/11/20/from-morden-to-ropsten/
	
#### PRODUCTION (productive chain)

start geth like this:

	geth console

for first startup (syncing) start it like this:

	geth --fast console

#### Expose the RPC on geth client
Once the Javascript console of geth appears you have to expose the the RPC interface.

	admin.startRPC("127.0.0.1", 8545, "*", "web3,net,eth,personal")

### Deploy Contract

User the solidity online compiler to get the contract ABI (interface description) and the deployment comments for geth.

Link: https://ethereum.github.io/browser-solidity

For the deployment in geth you should set the minAmount parameter (of contract constructor). If you want to send an initial amount of money to the newly created contract you should set the value parameter in JSON.

### Startup node server

Go to folder:

	./nodeserver/app/

For first startup run:

	npm install

Then you have to start the server by running:

	npm start

Note that there are a number of parameters that you have to pass to npm start like this:

	PARAM_KEY1="PARAM_VAL1" PARAM_KEY2="PARAM_VAL2" npm start

Parameter list:

	SLACK_BOT_TOKEN='[YOUR-SLACK-BOT-TOKEN]' 
	SLACK_BOT_NAME='[YOUR-SLACK-BOT-NAME]]' 
	EMAIL_ADR='[GMAIL-EMAIL-ADDRESS]' 
	EMAIL_PWD='[GMAIL-EMAIL-PWD]' 
	EMAIL_UNAME='[SOME_NAME]' 
	INIT_ACCOUNT_MONEY='[INIT_AMOUNT_IN_WEI]' 
	NETWORK_ID='[PROD or TEST]' 
	ADMIN_USERID='[SLACK-USER-ID in format: U3QH0L13J]' 
	ADMIN_ACCOUNT_ADR='[ADMIN-ACCOUNT-ADDRESS]' 
	ADMIN_ACCOUNT_PWD='[ADMIN-ACCOUNT-PWD]'
	ACCOUNT_FOLDER='/home/YOUR-USER/.ethereum/keystore/' 
	CONTRACT_ADR='[CONTRACT-ACCOUNT-ADDRESS]' 
	CONTRACT_ABI_PATH='../appconfig/' 
	CONTRACT_ABI_FILE='contract_abi.json'

Note: The ACCOUNT_FOLDER has to point to the folder that contains the ethereum account files (usually in the user data in some ~ethereum folder in sub-folder keystore).

### Communication through slack chat
In slack you have to address the slack-bot user and then send commands that are known to the SlackMessageProcessor class.

# Open Issues (TODOs)

* ~~Publish the project on GitHub, share it with the students~~
* Write a nice configuration/settings file, so one can handle the parameters in a more readable and extendable way! Also possible to use JSON based configuration file in combinatiion with generating parameters...
* Make more user friendly; add more "help features"
* Make the application more testable (more refactoring)
* Add tests to the nodeserver...
* change the slack part to use the 'slackbots' module, checkout this tutorial: https://scotch.io/tutorials/building-a-slack-bot-with-node-js-and-chuck-norris-super-powers
* change the mechanism to address the bot, it should be possible to react to messages without the bot name.
* exctend the functionality and add other contracts (new MessageProcessor and EthereumContract class + configuration parameters).
* implement more persistence features, so we can store the account information etc.


