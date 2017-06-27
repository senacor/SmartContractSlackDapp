var Lottery = artifacts.require("./Lottery.sol");
var init_amount = 1000000000000;

module.exports = function(deployer) {
  deployer.deploy(Lottery, init_amount);
};
