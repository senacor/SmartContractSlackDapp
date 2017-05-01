# Lottery Contract

### Introduction

The lottery is a simple contract that allows users to send money to the contract that is stored in the contract. 

The admin has to end the lottery (a time base version could be implemented too, this version is based on ending the lottery by admin user). 
Once the admin ends the lottery a winner will be picked ('randomly' by current blocknumber).

Once the winner was picked only the winner will be able to to transfer the pot (money in contract) to his account by calling a transfer funcion.

For details please check the Lottery.sol contract file. The contract methods should be self-explanatory.

### The setup

You need two frameworks setup for testing the lottery contract:

* [dapple](https://github.com/dapphub/dapple)
* javacsript (mocha + chaithereum)

## Run the tests

To run the dapple tests: 

	dapple test

To run the javascript tests:

	npm install (only once)
	npm run test-js

Note: You can run all tests using the command:

	npm install (only once)
	npm run test

## Most important files:

Lottery Contract file (solidity):

	./src/Lottery.sol

dapple test file:

	./src/Lottery_test.sol

javascrip test file:

	./test/Lottery.js

General note: The documentation of the used test-frameworks is horrible. Some things seem to be highly experimental. I could not understand certain behavior. The tests are by far NOT complete at the moment!



