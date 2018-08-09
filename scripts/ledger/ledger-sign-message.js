var TransportHID       = require("@ledgerhq/hw-transport-node-hid").default;
var LedgerEth          = require("@ledgerhq/hw-app-eth").default;

if (process.argv.length != 4) {
    throw new Error("USAGE: node ledger-sign-message.js \"BIP32_PATH\" MESSAGE \n bip32 e.g. \"44'/60'/0/0\"")
}

// NOTE: only 44'/60', 44'/61' and 44'/1' are supported by the default eth app
// https://github.com/LedgerHQ/blue-app-eth/blob/master/Makefile.genericwallet#L30
var bip32_path = process.argv[2];

// Since we can pass hex, can we remove the ascii conversion in the contract?
var message = Buffer.from(process.argv[3]).toString("hex");

function translateV(v) {
    if (v === 27) {
	return "1b"
    } else if (v === 28) {
	return "1c"
    } else {
	throw new Error("Invalid Signture V field: " + v)
    }
}

TransportHID.create().then(transport => {
    new LedgerEth(transport).signPersonalMessage(bip32_path, message).then(result => {
        console.log(result['r'] + result['s'] + translateV(result['v']));
    });
})
