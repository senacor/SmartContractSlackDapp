pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Lottery.sol";

contract TestLottery {

  // Important Note: Writing tests in solidity is NOT recommended! 
  // The current state of the documentation concerning solidity-test-writing in truffle is very bad.
  // It is not possible to pass value arguments with the constructor; 
  // It is furthermore unclear how to deploy the contract from a specific address so one can check against the admin address.
  
  // Recommendation: Write JavaScript Tests instead!

  Lottery lottery;
  uint testMinFunds;

  function beforeAll() {
    testMinFunds = 100000000000;
    lottery = new Lottery(testMinFunds);
    // Note: tried to pass value argument upon deployment; not possible
  }

  function testMinBalanceSetAfterCreatingNewContract() {
    uint expected = testMinFunds;

    Assert.equal(lottery.getMinimumStakeInWei(), expected, "Minimum stake set in newly ceated Lottery");
  }

  function testPlaceBetsPot() {
    Assert.equal(lottery.getPot(), 0, "Pot is zero in beginning");

    //lottery.placeBets.value(testMinFunds)();
    //Assert.equal(lottery.getPot(), testMinFunds, "");
    //lottery.placeBets.value(testMinFunds)();
    //Assert.equal(lottery.getPot(), testMinFunds * 2, "");
    //lottery.placeBets.value(testMinFunds)();
    //Assert.equal(lottery.getPot(), testMinFunds * 3, "");
  }

}