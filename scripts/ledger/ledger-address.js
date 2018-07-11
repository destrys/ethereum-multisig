var TransportHID       = require("@ledgerhq/hw-transport-node-hid").default;
var LedgerEth          = require("@ledgerhq/hw-app-eth").default;

if (process.argv.length != 3) {
    throw new Error("USAGE: node ledger-address.js \"BIP32_PATH\" \n bip32 e.g. \"44'/60'/0/0\"")
}

// NOTE: only 44'/60', 44'/61' and 44'/1' are supported by the default eth app
// https://github.com/LedgerHQ/blue-app-eth/blob/master/Makefile.genericwallet#L30

var bip32_path = process.argv[2];

TransportHID.create().then(transport => {
    return new LedgerEth(transport).getAddress(bip32_path, true, true).then(o => {
	console.log(o.address);
    })
})
