var DEFAULT_TESTRPC_HOST = "localhost";
var DEFAULT_TESTRPC_PORT = 8545;
var TESTRPC_HOST         = (process.env.TESTRPC_HOST || DEFAULT_TESTRPC_HOST);
var TESTRPC_PORT         = (process.env.TESTRPC_PORT || DEFAULT_TESTRPC_PORT);

console.log("Truffle using network at " + TESTRPC_HOST + ":" + TESTRPC_PORT);

require('babel-polyfill')

module.exports = {
    networks: {
	development: {
	    host:       TESTRPC_HOST,
	    port:       TESTRPC_PORT,
	    network_id: "*", // Match any network id
	    gas:        4600000
	}
    },
    description: "A multisig Ethereum address with spending authorized by Trezors.",
    authors: [
	"Destry Saul <destry@unchained-capital.com>",
	"Dhruv Bansal <dhruv@unchained-capital.com>"
    ],
    keywords: [
	"ethereum",
	"multisig",
	"trezor"
    ],
    license: "MIT"
};
