const solc = require('solc')
const fs = require('fs')
const path = require('path')

const contractDir = 'src'

let contracts = fs.readdirSync(contractDir)

let sources = {}

for(let contract of contracts) {
  if(contract.endsWith('_test.sol')) continue
  sources[contract] = fs.readFileSync(`${contractDir}/${contract}`).toString()
}

let result = solc.compile({sources})

if(result.errors) {
  for(let error of result.errors) {
    console.log(error)
  }
}

if(!result.contracts) process.exit(1)

if(!fs.existsSync('generated')) {
  fs.mkdirSync('generated')
}

fs.writeFileSync('generated/contracts.json', JSON.stringify(result, null, 2))