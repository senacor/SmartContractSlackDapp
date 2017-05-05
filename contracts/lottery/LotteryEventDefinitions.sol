pragma solidity ^0.4.5;

contract LotteryEventDefinitions {
    event UserRegistrationEvent(address adr);
    event LotteryEnd(address winner);
    event UserPutBets(address user, uint currentPot);

	event WinnerTookItAll(string msg);
    event WinnerFailedToTakeWin(string msg);
    event SomeGuyTriedToTakeTheWinnings(string msg, address someGuy);
    //event GameNotOverYet(string msg);
    // event ThePotIsEmpty(string msg);
    event NobodyPlayedWithdrewInitialAmount(string msg);
}