// These are the javascript unit-tests, running with Chaithereum and moccha
// check the chaithereum document ation for details
// in this setup the js tests have to be put into the /test folder
const Chaithereum = require('chaithereum')
const contracts = require('../modules/contracts')

// if you want to test on testnet:
//const Web3 = require('web3');
// NOTE: one might have to adapt the moccha settings then, otherwise one will run into timeout

const chaithereum = new Chaithereum
// once can specify provider here too:
/*const chaithereum = new Chaithereum({
  provider: new Web3.providers.HttpProvider('http://localhost:8545')
})*/



before(() => {
  return chaithereum.promise
})

describe('Lottery', () => {
  let lottery

  beforeEach(() => {
    lottery = chaithereum.web3.eth.contract(contracts.Lottery.abi).new.q({ 
      data: contracts.Lottery.bytecode
      // if one wants to deploy to testnet, one has to set the gas manually
      // gas: 4000000
    })
  })

  it('should deploy', () => {
    return lottery.should.eventually.be.contract
  })


  it('should register user address', () => {
    const userAdr = chaithereum.accounts[1];

    return lottery.then((lottery) => 
      lottery.register.q(userAdr, { from: chaithereum.account })
      .then(() => lottery.isRegistered.q(0,{ from: chaithereum.accounts[1] }).should.eventually.be.equal(1))
    )
  })

})