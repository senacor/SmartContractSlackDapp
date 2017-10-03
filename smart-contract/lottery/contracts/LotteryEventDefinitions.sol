pragma solidity ^0.4.5;

contract LotteryEventDefinitions {
    event UserRegistrationEvent(address adr);
    event LotteryEnd(address winner);
    event UserPutBets(address user, uint currentPot);

	event WinnerTookItAll(string message);
    event WinnerFailedToTakeWin(string message);
    event SomeGuyTriedToTakeTheWinnings(string message, address someGuy);
    event NobodyPlayedWithdrewInitialAmount(string message);
}