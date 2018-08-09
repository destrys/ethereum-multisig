var fs   = require("fs");
var path = require('path');

var rootDir = path.normalize(path.join(__dirname, ".."));

function parsedCompiledContract() {
    var compiledContractPath = path.join(rootDir, "build/contracts/MultiSig2of3.json");
    if (fs.existsSync(compiledContractPath)) {
	var compiledContract = require(compiledContractPath);
	return compiledContract;
    } else {
	throw("Contract has not been compiled yet.");
    }
}

module.exports = {
    parsedCompiledContract
}
