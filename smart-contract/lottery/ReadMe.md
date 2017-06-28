# Lottery Contract

### Introduction

The lottery is a simple contract that allows users to send money to the contract that is stored in the contract. 

The admin has to end the lottery (a time base version could be implemented too, this version is based on ending the lottery by admin user). 
Once the admin ends the lottery a winner will be picked ('randomly' by current blocknumber).

Once the winner was picked only the winner is able to to transfer the pot (money in contract) to his account by calling a transfer funcion. 
After the game was ended and the winner took the funds the admin can reset the lottery and one can play again. 

For details please check the ```Lottery.sol``` contract file located in the ```contracts``` folder. The contract methods should be self-explanatory.

Note that picking a winner is not "secure random", but just according to the current block-hash. The lottery contract is a simple example to show how smart contracts work. If you are interested in introducing RNG into a smart contract you can take a look at the [RanDAO](https://github.com/randao/randao).

The contract-project was setup according to the specification of the [truffle framework](http://truffleframework.com/docs/). 

## contracts and migrations

The ```contracts``` folder contains the ```Lottery.sol``` contract file as well as two more files:

1. ```LotteryEventDefinitions.sol``` contains the event definitions of all the events used by the ```Lottery.sol``` contract.
2. ```Migrations.sol``` is a contract provided by the truffle framework that manages the deployments of the ```Lottery.sol``` contract.

The ```migrations``` folder contains the migration scrips according to the truffle specification. 

Please check the [truffle documentation](http://truffleframework.com/docs/) for more details.

## Test setup

The tests for the lottery contract are located in the ```test``` folder.

There are 2 kinds of tests available:

1. Tests written in javascript (using Mocha)
2. Tests written in Solidity 

Both tests-styles were used according to the truffle specification. 

***It is recommended to focus on the [tests written in javascirpt](https://github.com/senacor/SmartContractSlackDapp/blob/master/smart-contract/lottery/test/lottery.js).***

The tests written in solidity are far from being complete. This is because the documentation on writing solidity tests in truffle is really bad. There are very few examples out there. 
Previously we used [dapple](http://dapple.readthedocs.io/en/latest/) for writing tests in solidity; however it seemed dapple is not maintained any more. Features that were requested over a year ago were not worked into the framework. Recently dapple was moved to a new project called [Dapp](https://dapp.readthedocs.io/en/latest/). Further investigation will be needed to evaluate if it is powerful enough for complete tests.
For now we switched to truffle for testing.


### Run the tests

Make sure to start the testrpc in a separate terminal by running the command:

```testrpc``` 

To run the test make sure you navigated into the current folder (```smart-contract/lottery```) folder in your terminal. Then run the command:

```
truffle test
```

Since running the tests includes compiling the contract(s), you don't have to run ```truffle compile``` first - but you can if you want.


## Most important files:

lottery Contract file (solidity): ```./contracts/Lottery.sol```

javascript test file: ```./test/lottery.js```

solidity test file: ```./test/TestLottery.sol```




