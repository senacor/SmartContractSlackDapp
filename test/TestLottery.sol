pragma solidity >= 0.4.5;
import 'truffle/Assert.sol';
import "truffle/DeployedAddresses.sol";
import '../contracts/lottery/Lottery.sol';
import '../contracts/lottery/LotteryEventDefinitions.sol';

contract LotteryTest {
  Lottery lottery;
  Lottery lotteryWithInitialPot;
  Tester proxy_tester;
  Tester proxy_admin;

  uint testMinFunds;
  //string test_party = "test_party";

  // function that happens before any other test (like jUnit)
  function setUp() {
    testMinFunds = 1000000000000000000;

    lottery = new Lottery(testMinFunds);
    
    // passing initial value in constructor did not work, skip test
    //lotteryWithInitialPot = new Lottery(testMinFunds)(testMinFunds);

    proxy_admin = new Tester();
    proxy_admin._target(lottery);

    proxy_tester = new Tester();
  }

  function testAdminIsAdmin() {
    assertEq(address(this), lottery.admin() );
  }

  function testPlaceBets() {
    lottery.placeBets.value(testMinFunds)();
  }

  function testThrowPlaceBetsInsufficientFunds() {
    lottery.placeBets.value(testMinFunds - 1)();
  }

  function testThrowPlaceBetsLotteryAlreadyEnded() {
    lottery.endLottery();
    lottery.placeBets.value(testMinFunds)();
  }

  function testEndLottery() {
    lottery.placeBets.value(testMinFunds)();
    lottery.endLottery();
  }

  function testPlaceBetsPot() {
    lottery.placeBets.value(testMinFunds)();
    assertEq(lottery.getPot(), testMinFunds);
    lottery.placeBets.value(testMinFunds)();
    assertEq(lottery.getPot(), testMinFunds * 2);
    lottery.placeBets.value(testMinFunds)();
    assertEq(lottery.getPot(), testMinFunds * 3);
  }

  function testCompleteCycle() {
    lottery.placeBets.value(testMinFunds)();
    lottery.placeBets.value(testMinFunds)();
    lottery.placeBets.value(testMinFunds)();
    lottery.endLottery();
    lottery.transferPotToWinner();
    assertEq(lottery.getPot(), 0);
  }

  function testSeveralCompleteCycles() {
    lottery.placeBets.value(testMinFunds)();
    lottery.placeBets.value(testMinFunds)();
    lottery.placeBets.value(testMinFunds)();
    lottery.endLottery();
    lottery.transferPotToWinner();
    assertEq(lottery.getPot(), 0);
    lottery.resetLottery(testMinFunds);
    lottery.placeBets.value(testMinFunds)();
    lottery.placeBets.value(testMinFunds)();
    lottery.placeBets.value(testMinFunds)();
    lottery.endLottery();
    lottery.transferPotToWinner();
    assertEq(lottery.getPot(), 0);
  }

  function testThrowtransferPotToWinnerGameNotOverYet() {
      lottery.placeBets.value(testMinFunds)();
      lottery.transferPotToWinner();
  }

  function testRescueInitialAmountIfNobodyPlayed() {
    assertEq(lottery.getNrOfParticipants(), 0);
    lottery.rescueInitialAmountIfNobodyPlayed();
    assertEq(lottery.getPot(), 0);
  }

  
}