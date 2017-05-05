const { spawn } = require('child_process');
const TestRPC = require("ethereumjs-testrpc");
var Config = require("truffle-config");
var Command = require("./node_modules/truffle/lib/command");
var TaskError = require("./node_modules/truffle/lib/errors/taskerror");
var TruffleError = require("truffle-error");
var Resolver = require("truffle-resolver");
var pkg = require("./node_modules/truffle/package.json");
var OS = require("os");

const server = TestRPC.server();
server.listen(8545, function(err, blockchain) {
    const command = new Command(require("./node_modules/truffle/lib/commands"));
    command.run('test', { logger: console }, function(err, result) {
        if (err) {
            if (err instanceof TaskError) {
            command.args
                .usage("Truffle v" + pkg.version + " - a development framework for Ethereum"
                + OS.EOL + OS.EOL
                + 'Usage: truffle <command> [options]')
                .epilog("See more at http://truffleframework.com/docs")
                .showHelp();
            } else {
                if (err instanceof TruffleError) {
                    console.log(err.message);
                } else if (typeof err == "number") {
                    // If a number is returned, exit with that number.
                    process.exit(err);
                } else {
                    // Bubble up all other unexpected errors.
                    console.log(err.stack || err.toString());
                }
            }
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
});