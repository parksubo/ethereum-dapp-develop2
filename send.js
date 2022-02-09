module.exports = function() {

    web3.eth.getAccounts().then((accounts) => {
        web3.eth.sendTransaction({
            from:accounts[0],
            to: "0xcb51464b6bf04D77074b6eD5ad515E34BF77d95d",
            value:web3.utils.toWei("10", "ether")
        });
    });

}