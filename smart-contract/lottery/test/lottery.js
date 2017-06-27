var Lottery = artifacts.require("./Lottery.sol");

//var expect = require('chai').expect;

var log = console.log;

// This is a set of test cases for the lottery contract.
// There is still quite a lot of room for improvement.
// These test cases can be taken as examples for writing your own tests.
contract('Lottery', function(accounts) {

  describe('Lottery: Complete Cylce', function() {

    var lot = null;
    var minStake = 1000000000000;
    var initPot = 10000000000000;
    var currPot = 0;

    var admin = accounts[0];

    before(function(done){

      Lottery.new(minStake, {from: admin, value: initPot})
      .catch(log)
      .then(function(contract){
          lot = contract;
      })
      .then(done);

    });

    // function that runs all initialization checks
    function testInitializationOfLottery() {
      it("should init lottery" , function(){
        assert.notEqual(lot, null);
      });

      it("should init initial pot correctly" , function(){
        return lot.getPot.call().then(function(actual) {
            currPot = initPot;
            assert.equal(actual, initPot, "pot was not initialized correctly")
          });
      });

      it("should init minimum stake correctly" , function(){
        return lot.getMinimumStakeInWei.call().then(function(actual) {
            assert.equal(actual, minStake, "minimum stake was not initialized correctly")
          });
      });

      it("should init winner correctly" , function(){
        return lot.getWinner.call().then(function(actual) {
            assert.equal(actual, '0x0000000000000000000000000000000000000000', "winner was not initialized correctly")
          });
      });

      it("should init NrOfParticipants correctly" , function(){
        return lot.getNrOfParticipants.call().then(function(actual) {
            assert.equal(actual, 0, "NrOfParticipants was not initialized correctly")
          });
      });

      it("should init the game-closed correctly" , function(){
        return lot.isGameClosed.call().then(function(actual) {
            // -----------------------------------------------------------------------------------------
            // CHECK IF LOTTREY WAS INITIALIZED CORRECTLY
            testInitializationOfLottery();
          });
      });
    }
    

    // -----------------------------------------------------------------------------------------
    // PLACING BETS
    describe('placeBets', function() {
      it("should increase pot upon placing a bet", function() {
        return lot.placeBets({from:accounts[1], value: minStake}).then(function() {
          return lot.getPot.call();
        }).then(function(actual) {
          currPot += minStake;
          assert.equal(actual, currPot, "bet could not be placed correctly")
        });
      });

      it("should increase pot again upon placing another bet", function() {
        return lot.placeBets({from:accounts[2], value: minStake}).then(function() {
          return lot.getPot.call();
        }).then(function(actual) {
          currPot += minStake;
          assert.equal(actual, currPot, "bet could not be placed correctly")
        });
      });
    });

    // -----------------------------------------------------------------------------------------
    // ENDING THE LOTTERY
    describe('endLottery', function() {
      it("should not end the game if a player that is not the admin tries to end the game", function() {
        return lot.endLottery({from: accounts[1]})
        .then(assert.fail) 
        .catch(function(error) {
            assert(error.toString().indexOf("invalid opcode") >= 0, error.toString());
        });
      });


      it("should end the game if the admin ends the game", function() {
        return lot.endLottery({from: admin}).then(function() {
          return lot.isGameClosed.call().then(function(actual) {
            assert.equal(actual, true, "game could not be closed by admin")
          });
        });
      });
    });
   
    // -----------------------------------------------------------------------------------------
    // RETRIEVING FUNDS
    describe('winner retrieves funds', function() {
      it("should have a winner set" , function(){
        return lot.getWinner.call().then(function(actual) {
            assert.notEqual(actual, '0x0000000000000000000000000000000000000000', "winner was not chosen correctly");
          });
      });

      it("should not retrive the winnings when not the winner" , function(){
        return lot.transferPotToWinner({from: admin}).then(function() {
          return lot.getPot.call().then(function(actual) {
            assert.equal(actual, currPot, "pot was not reset correctly after winner took funds")
          });
        });
      });

      it("should retrieve winnings as winner" , function(){
        return lot.getWinner.call().then(function(actual) {
          return lot.transferPotToWinner({from: actual}).then(function() {
            return lot.getPot.call().then(function(actual) {
              assert.equal(actual, 0, "pot was not reset correctly after winner took funds")
            });
          });
        });
      });
    
    });


    // -----------------------------------------------------------------------------------------
    // RESET LOTTERY
    describe('reset lottery', function() {

      it("should not reset the lottery if a player that is not the admin tries to reset", function() {
        return lot.resetLottery(minStake, {from: accounts[1], value: initPot})
        .then(assert.fail) 
        .catch(function(error) {
            assert(error.toString().indexOf("invalid opcode") >= 0, error.toString());
        });
      });

      it("should reset the lottery if the admin resets it", function() {
        return lot.resetLottery(minStake, {from: admin, value: initPot}).then(function() {
          // nothing to assert here, the assertions will be done in the test init function below
        });
      });

    });

    testInitializationOfLottery();
  });
});

// TODO: More test cases for edge-cases
// e.g.: what if only one player plays?
// what if reset is called twice?
// tests for recueInitialAmount
// ...

// TODO: Make test cases more independent from each other...