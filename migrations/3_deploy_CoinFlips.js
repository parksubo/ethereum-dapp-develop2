var coinFlips = artifacts.require("./CoinFlips.sol");

module.exports = function(deployer) {
    deployer.deploy(coinFlips);
}