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

console.log("Message Hex: " + message);

TransportHID.create().then(transport => {
    new LedgerEth(transport).signPersonalMessage(bip32_path, message).then(result => {
        console.log("Signature R: 0x" + result['r']);
        console.log("Signature S: 0x" + result['s']);
        console.log("Signature V: 0x0" + (result['v'] - 27));
    });
})
