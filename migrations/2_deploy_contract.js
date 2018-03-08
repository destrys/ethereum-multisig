var TrezorMultiSig2of3 = artifacts.require("./TrezorMultiSig2of3.sol");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(TrezorMultiSig2of3, accounts[0], accounts[1], accounts[2]);
};
