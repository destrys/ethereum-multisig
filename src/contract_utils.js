var trezor_utils = require("./trezor_utils");

function parseTrezorSignature(signature) {
}


function signWithTrezor(path, contractAddress, destinationAddress, value) {
    return contractAddress.generateMessageToSign(destinationAddress, value).then(function(message) {
	s = unescape(encodeURIComponent(message.split('0x')[1]));
	var h = '';
        for (var i = 0; i < s.length; i++) {
            h += s.charCodeAt(i).toString(16);
        }
	console.log('MESSAGE', h);	
	return trezor_utils.callTrezor(function(device, session, resolve, reject) {
	    session.signEthMessage(bip32SequenceFromPath(path), h).then(function(result) {
	    	var sig = result.message.signature;
	    	console.log('THIS WORK?',result.message.signature);
	    	resolve(sig);
	    });
	});
    });
}

function messageToSign(contractAddress, destinationAddress) {
}

function getEthereumAddresses(path) {
    return trezor_utils.callTrezor(function(device, session, resolve, reject) {
	session.ethereumGetAddress(bip32SequenceFromPath(path)).then(function(result) {
            var address1 = result.message.address;
	    resolve(address1);	
	});
    });   
}

// function getEthereumAddresses(paths) {
//     console.log("getEthereumAddress - run");
//     return trezor_utils.callTrezor(function(device, session, resolve, reject) {
// 	console.log('getEthereumAddress - interaction');
// 	session.ethereumGetAddress(bip32SequenceFromPath(paths[0])).then(function(result, resolve, reject) {
//             var address1 = result.message.address;
// 	    console.log('address1', address1);
// 	    return trezor_utils.callTrezor(function(device, session, resolve, reject) {
// 		session.ethereumGetAddress(bip32SequenceFromPath(paths[1])).then(function(result2, resolve, reject) {
// 		    var address2 = result2.message.address;
//         	    console.log('address2', address2);
// 		    return trezor_utils.callTrezor(function(device, session, resolve, reject) {
//    			session.ethereumGetAddress(bip32SequenceFromPath(paths[2])).then(function(result3, resolve, reject) {
// 			    var address3 = result3.message.address;
// 			    console.log('address3', address3);		    
// 			    Promise.resolve([address1, address2, address3]);
// 			});
// 			resolve(address1);
// 		    });
// 		    resolve(address1);
// 		});
// 		resolve(address1);
// 	    });
// 	    resolve(address1);
// 	});
//     });   
// }

function bip32SequenceFromPath(path) {
    // See https://github.com/trezor/connect/blob/master/connect.js
    return path
    .toLowerCase()
    .split('/')
    .filter(function (p) { return p !== 'm'; })
    .map(function (p) {
        var hardened = false;
        if (p[p.length - 1] === "'") {
            hardened = true;
            p = p.substr(0, p.length - 1);
        }
        if (isNaN(p)) {
            throw new Error('Not a valid path.');
        }
        var n = parseInt(p);
        if (hardened) { // hardened index
            n = (n | 0x80000000) >>> 0;
        }
        return n;
    });
}
    
module.exports = { bip32SequenceFromPath, parseTrezorSignature, signWithTrezor, getEthereumAddresses }
