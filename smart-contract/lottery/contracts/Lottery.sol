pragma solidity ^0.4.5;
import './LotteryEventDefinitions.sol';

contract Lottery is LotteryEventDefinitions {
    uint public pot; // the money that one can win

    address[] public participants; // the addreses of the participants that place bets
    address public winner; // the winner (will be chosen upon ending the lottery)

    // TODO: If there is still time then work on the registration functionality.

    // 1 ether = 1000000000000000000 wei
    uint public minimumStakeInWei;
    bool public gameClosed = false;

    address public admin;

    /* one can pass money initially to set an initial pot. */
    function Lottery (
        uint minStakeInWei
    ) payable {
        pot = msg.value;
        minimumStakeInWei = minStakeInWei;
        admin = msg.sender;
        gameClosed = false;
    }

    /** -------- MODIFIERS -------- **/

    modifier adminOnly() {
        if (msg.sender == admin) { _; } 
        else { throw; }
    }

    modifier sufficientFunds() {
        if (msg.value < minimumStakeInWei) { throw; }
        else { _; }
    }

    modifier gameOngoing() {
        if (gameClosed) { throw; }
        else { _; }
    }

    modifier afterGameClosed() {
        // check if the deadline was already reached.
        if (gameClosed) { _; } 
        else { 
            //GameNotOverYet("The game lottery was not ended yet. Only the admin can end the lottery.");
            throw; 
        }
    }

    modifier winningConstraints() {
        if (pot != 0 && participants.length > 0) { _; } 
        else {
            //ThePotIsEmpty("Nothing to withdraw!");
            throw;
        }
    }

    modifier winnerTookPot() {
        if (pot == 0) { _; }
        else { throw; }
    }

    /** -------- FUNCTIONS -------- **/

    function resetLottery(uint _minimumStakeInWei) payable adminOnly afterGameClosed winnerTookPot {
        participants.length = 0;
        minimumStakeInWei = _minimumStakeInWei;
        gameClosed = false;
        pot = msg.value;
    }

    function placeBets() payable sufficientFunds gameOngoing {
        pot += msg.value;
        participants.push(msg.sender);
        UserPutBets(msg.sender, pot);
    }

    function endLottery() adminOnly {
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

    function transferPotToWinner() afterGameClosed winningConstraints {
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
    function rescueInitialAmountIfNobodyPlayed() adminOnly afterGameClosed {
        if (participants.length > 0) throw;

        if (admin.send(pot)) {
            pot = 0;
            gameClosed = true;
            NobodyPlayedWithdrewInitialAmount("Game closed. Nobody played.");
        }
    }

    /** -------- GETTER -------- **/

    function getWinner() constant returns (address) {
        return winner;
    }

    function getParticipants() constant returns (address[]) {
        return participants;
    }

    function getNrOfParticipants() constant returns (uint) {
        return participants.length;
    }

    function getPot() constant returns(uint) {
        return pot;
    }

    function getMinimumStakeInWei() constant returns (uint) {
        return minimumStakeInWei;
    }

    function isGameClosed() constant returns (bool) {
        return gameClosed;
    }
}