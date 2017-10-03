pragma solidity ^0.4.5;
import './LotteryEventDefinitions.sol';

contract Lottery is LotteryEventDefinitions {
    uint public pot; // the money that one can win

    address[] public participants; // the addreses of the participants that place bets
    address public winner; // the winner (will be chosen upon ending the lottery)

    // 1 ether = 1000000000000000000 wei
    uint public minimumStakeInWei;
    bool public gameClosed = false;

    address public admin;

    /* one can pass money initially to set an initial pot. */
    function Lottery (
        uint minStakeInWei
    ) public payable {
        pot = msg.value;
        minimumStakeInWei = minStakeInWei;
        admin = msg.sender;
        gameClosed = false;
    }

    /** -------- MODIFIERS -------- **/

    modifier adminOnly() {
        require(msg.sender == admin);
        _;
    }

    /** Note: old throw syntax in this modifier **/
    modifier sufficientFunds() {
        if (msg.value < minimumStakeInWei) { throw; }
        else { _; }
    }

    modifier gameOngoing() {
        require(!gameClosed);
        _;
    }

    modifier afterGameClosed() {
        require(gameClosed);
        _;
    }

    modifier winningConstraints() {
        require(pot != 0 && participants.length > 0);
        _;
    }

    modifier winnerTookPot() {
        require(pot == 0);
        _;
    }

    /** -------- FUNCTIONS -------- **/

    function resetLottery(uint _minimumStakeInWei) public payable adminOnly afterGameClosed winnerTookPot {
        participants.length = 0;
        minimumStakeInWei = _minimumStakeInWei;
        gameClosed = false;
        pot = msg.value;
    }

    function placeBets() public payable sufficientFunds gameOngoing {
        pot += msg.value;
        participants.push(msg.sender);
        UserPutBets(msg.sender, pot);
    }

    function endLottery() public adminOnly {
        if (participants.length == 0) {
            gameClosed = true;
            return;
        }

        // not very good random, but better than nothing at the moment.
        uint randWinAddr = uint(block.blockhash(block.number - 1)) % participants.length;
        winner = participants[randWinAddr];

        gameClosed = true;

        LotteryEnd(winner);
    }

    function transferPotToWinner() public afterGameClosed winningConstraints {
        if (winner == msg.sender) {
            if (winner.send(pot)) {
                pot = 0;
                winner = address(0);
                WinnerTookItAll("The winner withdrew the the pot successfully. Buy your friends a beer mate!");
            } else {
                WinnerFailedToTakeWin("Wooops, something went wrong, the winner was not able to withdrw his funds. Sorry dude, that was not planned.");
            }
        } else {
            SomeGuyTriedToTakeTheWinnings("Sorry, you are not the winner, no money for you!", msg.sender);
        }
    }

    /* This function can only be called by the owner of the contract.
    The owner can only withdraw the pot if nobody played and the deadline has passed. */
    function rescueInitialAmountIfNobodyPlayed() public adminOnly afterGameClosed {
        require(participants.length == 0);

        if (admin.send(pot)) {
            pot = 0;
            gameClosed = true;
            NobodyPlayedWithdrewInitialAmount("Game closed. Nobody played.");
        }
    }

    /** -------- GETTER -------- **/

    function getWinner() public constant returns (address) {
        return winner;
    }

    function getParticipants() public constant returns (address[]) {
        return participants;
    }

    function getNrOfParticipants() public constant returns (uint) {
        return participants.length;
    }

    function getPot() public constant returns(uint) {
        return pot;
    }

    function getMinimumStakeInWei() public constant returns (uint) {
        return minimumStakeInWei;
    }

    function isGameClosed() public constant returns (bool) {
        return gameClosed;
    }
}