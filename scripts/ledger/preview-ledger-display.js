var shajs              = require("sha.js");

if (process.argv.length != 3) {
    throw new Error("USAGE: node preview-ledger-display.js MESSAGE")
}

function ledgerDisplay(message) {
    let hash = shajs('sha256').update(message).digest('hex');
    let first4 = hash.substring(0,4).toUpperCase();
    let last4 = hash.substring(hash.length-4, hash.length).toUpperCase();
    return first4 + "..." + last4
}

console.log(ledgerDisplay(process.argv[2]))
