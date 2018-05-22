var contract_utils = require("../src/contract_utils");
var trezor_utils = require("../src/trezor_utils");

var TrezorMultiSig2of3 = artifacts.require("TrezorMultiSig2of3");

var deposit = 1000; // wei
var firstSpend = 100;
var secondSpend = 900;

// Wallet type arguements
var trezorType = 1;
var ledgerType = 2;

// Expected Error test for a failed require()
var vmExceptionText = "VM Exception while processing transaction: invalid opcode";

var contractAddress       = "0x1b95e1c82765f1b410499214939fb0afd2da9328"; 
var unsignedMessage       = "142e6535b34535af988d6fe022dba9100dabc41fa9de26962f4e5b6e79e9d041";
var unsignedMessage2      = "9bd9f4b563191943c9008219a2279fccf4d38eafe5e01e6fdfcf4097a2a2d727";

// The following addresses and signatures were generated with a trezor with wallet words:
// merge alley   lucky   axis penalty manage latin   gasp  virus    captain wheel deal
// chase fragile chapter boss zero    dirt   stadium tooth physical valve   kid   plunge
var trezorAddress1  = "0x8ed1e7ddd929b53e776484e645ba775ad8f52a63"; // m/44'/6626'/0'/0/0
var trezorSig1      = "0xac0d976bc3d374c2e0d09e0e616c29ae1fd083afff53b3abea8e2dce44b5807e27e40fe09dcd40f4dc684991fb3ff2d9d7df1edc3a1c7e005e8ea40f138c98081c";
var trezorV1        = "0x01";
var trezorR1        = "0xac0d976bc3d374c2e0d09e0e616c29ae1fd083afff53b3abea8e2dce44b5807e";
var trezorS1        = "0x27e40fe09dcd40f4dc684991fb3ff2d9d7df1edc3a1c7e005e8ea40f138c9808";

var trezorAddress2  = "0xef12b1c5c791c29d94ddfa621660bc079e093d27"; // m/44'/6627'/0'/0/0
var trezorSig2      = "0x7b1f0cee5967adabadf7ec09abfe07059192bf6f86c3cb21d06524fa6711653c2ce3bde36e476c01af434ca31dcf16ac7ff3b146cf994921433dc8504eece76b1c";
var trezorV2        = "0x01";
var trezorR2        = "0x7b1f0cee5967adabadf7ec09abfe07059192bf6f86c3cb21d06524fa6711653c";
var trezorS2        = "0x2ce3bde36e476c01af434ca31dcf16ac7ff3b146cf994921433dc8504eece76b";

var trezorAddress3  = "0x2909ee04bc57f06dfccd1f9e77aa58c2c61e1d2f"; // m/44'/6628'/0'/0/0
var trezorSig3      = "0xca85f157f2df89f1395a3df7f3fb9108ea5cacef8f8260a17a021120e4edd53b1975a2fb6beb4d07594ac8adb56cc3980e96e0ccac8cc5e0d5c75d1bb174e8651c";
var trezorV3        = "0x01";
var trezorR3        = "0xca85f157f2df89f1395a3df7f3fb9108ea5cacef8f8260a17a021120e4edd53b";
var trezorS3        = "0x1975a2fb6beb4d07594ac8adb56cc3980e96e0ccac8cc5e0d5c75d1bb174e865";

// Ledger Addresses and signatures using the wallet words above:
var ledgerAddress1  = "0x757e3B637Ed4649A04cDb83D14c73bE6a6991019"; // m/44'/60'/600'/0/0
var ledgerV1        = "0x01";
var ledgerR1        = "0x763f3a67f3997743a80cf1c2d6a29de2b8ed41de40c82e1e390c38935b1687f6";
var ledgerS1        = "0x3bc0135a8758e102fe0b2feade060fdbedad2f62401702021712bc24b1c28282";

var ledgerAddress2  = "0xa63B1930cBDd89ece8E1Db05a21C95aB1Ec35DbF"; // m/44'/60'/601'/0/0
var ledgerV2        = "0x00";
var ledgerR2        = "0x4700d5176f7aa8bb87c575946759d0ecdb66825ebde3c9e09950c2989a09b463";
var ledgerS2        = "0x22ede78ec43589e4d75d61eb9e60fb975ec8182c89c75c4c41f3f907e961e13b";

var ledgerAddress3  = "0x6519E8D43F81cBD3739E0970DF2e874c188586a6"; // m/44'/60'/602'/0/0
var ledgerV3        = "0x00";
var ledgerR3        = "0x4fa51ff4a2b238d3b2d9bbc19b9c09b1405910c786b5f24d15a14fb7e5d8287d";
var ledgerS3        = "0x0948b16d5095a0852277ea0f2159cdf1a0002726466828bede2376ca53aafb41";


// These signed messages are for the second spend tests.
var trezorSig1_1      = "0x71164425e6c5a0b68be2145f7391916d5dc3e6355c5b312b6f6fdea8aa73302b19b7e2a1ed13b96b64fcbe628bb1a2ae6757345cbcdd64372599a581f53e3f981c";
var trezorV1_1        = "0x01";
var trezorR1_1        = "0x71164425e6c5a0b68be2145f7391916d5dc3e6355c5b312b6f6fdea8aa73302b";
var trezorS1_1        = "0x19b7e2a1ed13b96b64fcbe628bb1a2ae6757345cbcdd64372599a581f53e3f98";

var trezorSig2_1      = "0xe5c977b8d96b684e1fe4a78cefcd4a55b0c606b0aa77d7df6cdb3e6371693d267fd3f50325405a7acd37c995dc29c2f667b3d1338737b409ceecb061dfe7daa71b";
var trezorV2_1        = "0x00";
var trezorR2_1        = "0xe5c977b8d96b684e1fe4a78cefcd4a55b0c606b0aa77d7df6cdb3e6371693d26";
var trezorS2_1        = "0x7fd3f50325405a7acd37c995dc29c2f667b3d1338737b409ceecb061dfe7daa7";

var trezorSig3_1      = "0x9f71c5416f93fd5e082f41e72367367d32c5c6fc5ea0424aa762f1457cd0b90f22ec69c498a7e7225c83b5877a0ea96e760cf319dfa8bbc7fc0a5c771c38a9f11c";
var trezorV3_1        = "0x01";
var trezorR3_1        = "0x9f71c5416f93fd5e082f41e72367367d32c5c6fc5ea0424aa762f1457cd0b90f";
var trezorS3_1        = "0x22ec69c498a7e7225c83b5877a0ea96e760cf319dfa8bbc7fc0a5c771c38a9f1";


function makeDeposit(accounts, testContract) {
    return web3.eth.sendTransaction({from: accounts[0], to: testContract.address, value: deposit});
}

function firstInvocation(accounts) {
    var currentNonce = web3.eth.getTransactionCount(accounts[0]);
    return (currentNonce == 4); // why 4?
}

contract('When constructing', function(accounts) {

    it("raises an error without any arguments", function() {
	return TrezorMultiSig2of3.new().then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, "TrezorMultiSig2of3 contract constructor expected 3 arguments, received 0");
	});
    });

    it("raises an error with a single argument", function() {
	return TrezorMultiSig2of3.new(accounts[1]).then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, "TrezorMultiSig2of3 contract constructor expected 3 arguments, received 1");
	});
    });

    it("raises an error with only two arguments", function() {
	return TrezorMultiSig2of3.new(accounts[1], accounts[2]).then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, "TrezorMultiSig2of3 contract constructor expected 3 arguments, received 2");
	});
    });

    it("raises an error with three arguments when the first two are duplicates", function() {
	return TrezorMultiSig2of3.new(accounts[1], accounts[1], accounts[3]).then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, vmExceptionText);
	});
    });

    it("raises an error with three arguments when the last two are duplicates", function() {
	return TrezorMultiSig2of3.new(accounts[1], accounts[3], accounts[3]).then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, vmExceptionText);
	});
    });

    it("raises an error with three arguments when the first and third are duplicates", function() {
	return TrezorMultiSig2of3.new(accounts[1], accounts[2], accounts[1]).then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, vmExceptionText);
	});
    });

    it("does not raise error with three distinct arguments", function() {
	return TrezorMultiSig2of3.new(accounts[1], accounts[2], accounts[3]).then(function(instance) {
	    return assert(true);
	});
    });
});

contract('When first created', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(accounts[1], accounts[2], accounts[3]).then(function(instance) {
	    testContract = instance;
	});
    });

    it("has a zero spendNonce value", function() {
	return testContract.spendNonce.call().then(function(nonce) {
	    assert.equal(nonce, 0);
	});
    });

    it("has a correct Major Version value", function() {
	return testContract.unchainedMultisigVersionMajor.call().then(function(major) {
	    assert.equal(major, 1);
	});
    });

    it("has a correct Minor Version value", function() {
	return testContract.unchainedMultisigVersionMinor.call().then(function(minor) {
	    assert.equal(minor, 0);
	});
    });
    
    it("can accept funds", function() {
	makeDeposit(accounts, testContract);
	return assert.equal(web3.eth.getBalance(testContract.address).toNumber(), deposit);
    });

    it("emits a 'Funded' event when accepting funds", function() {
	return testContract.sendTransaction({ from: accounts[0], to: testContract.address, value: deposit}).then(function(result) {
	    assert.equal(result.logs[0].event, "Funded");
	    assert.equal(result.logs[0].args.new_balance.toString(), deposit.toString());
	});
    });

});


contract('When first created', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	});
    });
    
    // Values for this test:
    // spendNonce - 0000000000000000000000000000000000000000000000000000000000000000
    // contact - 0x1b95e1c82765f1b410499214939fb0afd2da9328
    // value - 0000000000000000000000000000000000000000000000000000000000000064 (100 wei in hex)
    // dest - 0xe6398f0330aa3e501f873237051ec82eecc74cd5
    // message prehash - 0000000000000000000000000000000000000000000000000000000000000000e6398f0330aa3e501f873237051ec82eecc74cd500000000000000000000000000000000000000000000000000000000000000001b95e1c82765f1b410499214939fb0afd2da9328
    if (firstInvocation(accounts)) {
	it("returns the expected message to sign", function() {
	    return testContract.generateMessageToSign.call(accounts[4], firstSpend).then(function(message) {
                assert.equal(message,"0x142e6535b34535af988d6fe022dba9100dabc41fa9de26962f4e5b6e79e9d041");
	    });
	});
    }

    if (firstInvocation(accounts)) {
	it("raises an error when using the contract address as a destination in the message to sign", function() {
   	    return testContract.generateMessageToSign.call(contractAddress, firstSpend).then(function(instance) {assert(false, vmExceptionText)}).catch(function(e) {
	    return assert.equal(e.message, vmExceptionText);
	    });
	});
    }

});


contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)	    
	});
    });
    
    if (firstInvocation(accounts)) {
	it("can be killed by signed messages from the 1st & 2nd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])

	    return testContract.spend.sendTransaction(accounts[4], 100, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV2, trezorR2, trezorS2).then(function() {
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), "900");
	    });
	});
    }
});


contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(accounts[1], accounts[2], accounts[3]).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    it("can accept funds", function() {
	makeDeposit(accounts, testContract);
	return assert.equal(web3.eth.getBalance(testContract.address).toNumber(), deposit * 2);
    });

    it("emits a 'Funded' event when accepting funds", function() {
	return testContract.sendTransaction({ from: accounts[0], to: testContract.address, value: deposit}).then(function(result) {
	    assert.equal(result.logs[0].event, "Funded");
	    assert.equal(result.logs[0].args.new_balance.toString(), (deposit * 2).toString());
	});
    });

});

contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("can be spent by signed messages from the 1st & 2nd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedBalance = deposit - firstSpend

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV2, trezorR2, trezorS2).then(function() {
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
	    	var expectedTransfer = new web3.BigNumber(firstSpend)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});

contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("can be killed by signed messages from the 2nd & 3rd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedBalance = deposit - firstSpend

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, trezorType, trezorV2, trezorR2, trezorS2, trezorType, trezorV3, trezorR3, trezorS3).then(function() {
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
	    	var expectedTransfer = new web3.BigNumber(firstSpend)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});

contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("can be killed by signed messages from the 1st & 3rd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedBalance = deposit - firstSpend
	    	    
	    return testContract.spend.sendTransaction(accounts[4], firstSpend, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV3, trezorR3, trezorS3).then(function() {
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
	    	var expectedTransfer = new web3.BigNumber(firstSpend)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});

contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(ledgerAddress1, ledgerAddress2, ledgerAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("can be spent by signed messages from the 1st & 2nd LEDGER owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedBalance = deposit - firstSpend

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, ledgerType, ledgerV1, ledgerR1, ledgerS1, ledgerType, ledgerV2, ledgerR2, ledgerS2).then(function() {
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
	    	var expectedTransfer = new web3.BigNumber(firstSpend)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});

contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(ledgerAddress1, ledgerAddress2, ledgerAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("can be spent by signed messages from the 2nd & 3rd LEDGER owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedBalance = deposit - firstSpend

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, ledgerType, ledgerV2, ledgerR2, ledgerS2, ledgerType, ledgerV3, ledgerR3, ledgerS3).then(function() {
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
	    	var expectedTransfer = new web3.BigNumber(firstSpend)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});

contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(ledgerAddress1, ledgerAddress2, ledgerAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("can be spent by signed messages from the 1st & 3nd LEDGER owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedBalance = deposit - firstSpend

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, ledgerType, ledgerV1, ledgerR1, ledgerS1, ledgerType, ledgerV3, ledgerR3, ledgerS3).then(function() {
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
	    	var expectedTransfer = new web3.BigNumber(firstSpend)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});

contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, ledgerAddress2, ledgerAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("can be spent by signed messages from the Trezor first and Ledger second", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedBalance = deposit - firstSpend

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, trezorType, trezorV1, trezorR1, trezorS1, ledgerType, ledgerV3, ledgerR3, ledgerS3).then(function() {
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
	    	var expectedTransfer = new web3.BigNumber(firstSpend)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});

contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, ledgerAddress2, ledgerAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("can be spent by signed messages from the Ledger first and Trezor second", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedBalance = deposit - firstSpend

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, ledgerType, ledgerV3, ledgerR3, ledgerS3, trezorType, trezorV1, trezorR1, trezorS1).then(function() {
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
	    	var expectedTransfer = new web3.BigNumber(firstSpend)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});



contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("emits a 'Spent' event when it is correctly spent", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    
	    return testContract.spend(accounts[4], firstSpend, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV3, trezorR3, trezorS3).then(function(result) {
	    	assert.equal(result.logs[0].event, "Spent");
	    	assert.equal(result.logs[0].args.to, accounts[4]);
	    	assert.equal(result.logs[0].args.transfer.toString(), firstSpend.toString());
	    });
	});
    }
});

contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("throws an error when killed with invalid messages", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])

	    badTrezorR3 = trezorR3.replace('a', 'b');

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV3, badTrezorR3, trezorS3).then(function(instance) { 
	    	assert(false, "Expected error when killing"); 
	    }).catch(function(e) {
	    	assert.equal(e.message, vmExceptionText);
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), deposit.toString());
	    	var expectedTransfer = new web3.BigNumber(0)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});


contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("throws an error when killed with invalid value", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var transferAmount = 101; //(expects 100)	    

	    return testContract.spend.sendTransaction(accounts[4], transferAmount, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV3, trezorR3, trezorS3).then(function(instance) { 
	    	assert(false, "Expected error when killing"); 
	    }).catch(function(e) {
	    	assert.equal(e.message, vmExceptionText);
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), deposit.toString());
	    	var expectedTransfer = new web3.BigNumber(0)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});


contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("throws an error when killed with correct message signed by wrong account", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    
	    // correct message, signed with m/44'/6266'/1'/0/0
	    wrongR3 = 0x4a91feffc292332382522944951c3ce1027c16dd4d2d2d4dad6116a46e354b08;
            wrongS3 = 0x78e9a305789f5e61425d17a90d0da25d41836c9e9383f25f6afbc8a2a6054c2e;
	    wrongV3 = 0x01;
	    return testContract.spend.sendTransaction(accounts[4], firstSpend, trezorType, trezorV1, trezorR1, trezorS1, trezorType, wrongV3, wrongR3, wrongS3).then(function(instance) { 
	    	assert(false, "Expected error when killing"); 
	    }).catch(function(e) {
	    	assert.equal(e.message, vmExceptionText);
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), deposit.toString());
	    	var expectedTransfer = new web3.BigNumber(0)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});

contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("throws error when killed with wrong destination", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    
	    badDestination = accounts[5]

	    return testContract.spend.sendTransaction(badDestination, firstSpend, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV3, trezorR3, trezorS3).then(function(instance) { 
	    	assert(false, "Expected error when killing"); 
	    }).catch(function(e) {
	    	assert.equal(e.message, vmExceptionText);
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), deposit.toString());
	    	var expectedTransfer = new web3.BigNumber(0)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});


contract('When already spent once', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract);
	    testContract.spend.sendTransaction(accounts[4], firstSpend, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV3, trezorR3, trezorS3).then(function(instance) {
		return true;
	    });
	});
    });

    if (firstInvocation(accounts)) {
	it("has an incremented spendNonce value", function() {
	    return testContract.spendNonce.call().then(function(nonce) {
		assert.equal(nonce, 1);
	    });
	});
    }
});

contract('When already spent once', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract);
	    testContract.spend.sendTransaction(accounts[4], firstSpend, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV3, trezorR3, trezorS3).then(function(instance) {
		return true;
	    });
	});
    });

    if (firstInvocation(accounts)) {
	it("returns the expected message to sign", function() {
	    return testContract.generateMessageToSign.call(accounts[5], secondSpend).then(function(message) {
                assert.equal(message,"0x9bd9f4b563191943c9008219a2279fccf4d38eafe5e01e6fdfcf4097a2a2d727");
	    });
	});
    }
});

contract('When already spent once', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract);
	    testContract.spend.sendTransaction(accounts[4], firstSpend, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV3, trezorR3, trezorS3).then(function(instance) {
		return true;
	    });
	});
    });

    if (firstInvocation(accounts)) {
	it("can be spent by signed messages from the 1st & 2nd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[5])	    

	    return testContract.spend.sendTransaction(accounts[5], secondSpend, trezorType, trezorV1_1, trezorR1_1, trezorS1_1, trezorType, trezorV2_1, trezorR2_1, trezorS2_1).then(function() {
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), "0");
	    	var expectedTransfer = new web3.BigNumber(secondSpend)
	    	var increaseInDestination = web3.eth.getBalance(accounts[5]).minus(startingDestinationBalance);
	    	assert.equal(increaseInDestination.toString(), secondSpend.toString());
	    });
	});
    }
});

contract('When already spent once', function(accounts) {

    var testContract;

    beforeEach(function() {
	return TrezorMultiSig2of3.new(trezorAddress1, trezorAddress2, trezorAddress3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract);
	    testContract.spend.sendTransaction(accounts[4], firstSpend, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV3, trezorR3, trezorS3).then(function(instance) {
		return true;
	    });
	});
    });

    if (firstInvocation(accounts)) {
	it("cannot be spent by previously valid signed messages from the 1st & 2nd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedContractBalance = deposit - firstSpend
            

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, trezorType, trezorV1, trezorR1, trezorS1, trezorType, trezorV2, trezorR2, trezorS2).then(function() {
	    	assert(false, "Expected error when spending"); 
	    }).catch(function(e) {
	    	assert.equal(e.message, vmExceptionText);
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedContractBalance.toString());
	    	var expectedTransfer = new web3.BigNumber(firstSpend)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});
