var keccak = require('keccak');
var utils  = require('../src/utils');

module.exports = function(callback) {

    function parseCompiledContract(callback) {
	try {
	    return utils.parsedCompiledContract();
	} catch(e) {
	    callback("ERROR: " + e.message);
	}
    }

    var compiledContract   = parseCompiledContract(callback);
    var bytecode           = compiledContract.unlinked_binary;
    var hashedBytecode     = keccak('keccak256').update(bytecode).digest().toString('hex');
    console.log(hashedBytecode);
}
