var MultiSig2of3 = artifacts.require("MultiSig2of3");

var deposit = 1000; // wei
var firstSpend = 100;
var secondSpend = 900;

// Expected Error test for a failed require()
var vmExceptionTextRevert = "VM Exception while processing transaction: revert";

var contractAddress       = "0x1b95e1c82765f1b410499214939fb0afd2da9328"; 
var unsignedMessage       = "142e6535b34535af988d6fe022dba9100dabc41fa9de26962f4e5b6e79e9d041";
var unsignedMessage2      = "9bd9f4b563191943c9008219a2279fccf4d38eafe5e01e6fdfcf4097a2a2d727";

// The following addresses and signatures were generated with a trezor with wallet words:
// merge alley   lucky   axis penalty manage latin   gasp  virus    captain wheel deal
// chase fragile chapter boss zero    dirt   stadium tooth physical valve   kid   plunge

var address1  = "0x757e3B637Ed4649A04cDb83D14c73bE6a6991019"; // m/44'/60'/600'/0/0
var V1        = "0x01";
var R1        = "0x763f3a67f3997743a80cf1c2d6a29de2b8ed41de40c82e1e390c38935b1687f6";
var S1        = "0x3bc0135a8758e102fe0b2feade060fdbedad2f62401702021712bc24b1c28282";

var address2  = "0xa63B1930cBDd89ece8E1Db05a21C95aB1Ec35DbF"; // m/44'/60'/601'/0/0
var V2        = "0x00";
var R2        = "0x4700d5176f7aa8bb87c575946759d0ecdb66825ebde3c9e09950c2989a09b463";
var S2        = "0x22ede78ec43589e4d75d61eb9e60fb975ec8182c89c75c4c41f3f907e961e13b";

var address3  = "0x6519E8D43F81cBD3739E0970DF2e874c188586a6"; // m/44'/60'/602'/0/0
var V3        = "0x00";
var R3        = "0x4fa51ff4a2b238d3b2d9bbc19b9c09b1405910c786b5f24d15a14fb7e5d8287d";
var S3        = "0x0948b16d5095a0852277ea0f2159cdf1a0002726466828bede2376ca53aafb41";

// These signed messages are for the second spend tests.
var sig1_1      = "0dadf704af5361797cd0e6eb7f6e0bd3cdc4bbb994cf96d06f9f24e0360de4d050fbcdda11f9f9259db5dbf43769c2d07c1220b6a063ad7290b2cd3fa10541121b";
var V1_1        = "0x00";
var R1_1        = "0x0dadf704af5361797cd0e6eb7f6e0bd3cdc4bbb994cf96d06f9f24e0360de4d0";
var S1_1        = "0x50fbcdda11f9f9259db5dbf43769c2d07c1220b6a063ad7290b2cd3fa1054112";

var sig2_1      = "0567f30ccd338614e26354eb54b2a072034df43ad7e2c8ae234484202360c8b84b8ada29581b4c264d39db53f446c5a3c090e613b9307d96ca27df720713079c1c";
var V2_1        = "0x01";
var R2_1        = "0x0567f30ccd338614e26354eb54b2a072034df43ad7e2c8ae234484202360c8b8";
var S2_1        = "0x4b8ada29581b4c264d39db53f446c5a3c090e613b9307d96ca27df720713079c";

var sig3_1      = "20b644a8f3661f1b1f28ef79e16589297f8a934443323562749edcf2a5a77a1711ac8610ccbee830f59778e5909613ac11af8bdb3661f88330e24bb6ae02d3e81b";
var V3_1        = "0x00";
var R3_1        = "0x20b644a8f3661f1b1f28ef79e16589297f8a934443323562749edcf2a5a77a17";
var S3_1        = "0x11ac8610ccbee830f59778e5909613ac11af8bdb3661f88330e24bb6ae02d3e8";


function makeDeposit(accounts, testContract) {
    return web3.eth.sendTransaction({from: accounts[0], to: testContract.address, value: deposit});
}

function firstInvocation(accounts) {
    var currentNonce = web3.eth.getTransactionCount(accounts[0]);
    return (currentNonce == 4); // why 4?
}

contract('When constructing', function(accounts) {

    it("raises an error without any arguments", function() {
	return MultiSig2of3.new().then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, "MultiSig2of3 contract constructor expected 3 arguments, received 0");
	});
    });

    it("raises an error with a single argument", function() {
	return MultiSig2of3.new(accounts[1]).then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, "MultiSig2of3 contract constructor expected 3 arguments, received 1");
	});
    });

    it("raises an error with only two arguments", function() {
	return MultiSig2of3.new(accounts[1], accounts[2]).then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, "MultiSig2of3 contract constructor expected 3 arguments, received 2");
	});
    });

    it("raises an error with three arguments when the first two are duplicates", function() {
	return MultiSig2of3.new(accounts[1], accounts[1], accounts[3]).then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, vmExceptionTextRevert);
	});
    });

    it("raises an error with three arguments when the last two are duplicates", function() {
	return MultiSig2of3.new(accounts[1], accounts[3], accounts[3]).then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, vmExceptionTextRevert);
	});
    });

    it("raises an error with three arguments when the first and third are duplicates", function() {
	return MultiSig2of3.new(accounts[1], accounts[2], accounts[1]).then(function(instance) {assert(false, "Expected error in constructor")}).catch(function(e) {
	    return assert.equal(e.message, vmExceptionTextRevert);
	});
    });

    it("does not raise error with three distinct arguments", function() {
	return MultiSig2of3.new(accounts[1], accounts[2], accounts[3]).then(function(instance) {
	    return assert(true);
	});
    });
});

contract('When first created', function(accounts) {

    var testContract;

    beforeEach(function() {
	return MultiSig2of3.new(accounts[1], accounts[2], accounts[3]).then(function(instance) {
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
	    assert.equal(major, 2);
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
	    assert.equal(result.logs[0].args.newBalance.toString(), deposit.toString());
	});
    });

});


contract('When first created', function(accounts) {

    var testContract;

    beforeEach(function() {
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
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
   	    return testContract.generateMessageToSign.call(contractAddress, firstSpend).then(function(instance) {assert(false, vmExceptionTextRevert)}).catch(function(e) {
	    return assert.equal(e.message, vmExceptionTextRevert);
	    });
	});
    }

});


contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)	    
	});
    });
    
    if (firstInvocation(accounts)) {
	it("can be killed by signed messages from the 1st & 2nd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])

	    return testContract.spend.sendTransaction(accounts[4], 100, V1, R1, S1, V2, R2, S2).then(function() {
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), "900");
	    });
	});
    }
});


contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return MultiSig2of3.new(accounts[1], accounts[2], accounts[3]).then(function(instance) {
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
	    assert.equal(result.logs[0].args.newBalance.toString(), (deposit * 2).toString());
	});
    });

});

contract('When already funded', function(accounts) {

    var testContract;

    beforeEach(function() {
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("can be spent by signed messages from the 1st & 2nd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedBalance = deposit - firstSpend

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V2, R2, S2).then(function() {
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
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("can be killed by signed messages from the 2nd & 3rd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedBalance = deposit - firstSpend

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, V2, R2, S2, V3, R3, S3).then(function() {
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
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("can be killed by signed messages from the 1st & 3rd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedBalance = deposit - firstSpend
	    	    
	    return testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V3, R3, S3).then(function() {
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
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("emits a 'Spent' event when it is correctly spent", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    
	    return testContract.spend(accounts[4], firstSpend, V1, R1, S1, V3, R3, S3).then(function(result) {
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
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("throws an error when killed with invalid messages", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])

	    badR3 = R3.replace('a', 'b');

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V3, badR3, S3).then(function(instance) { 
	    	assert(false, "Expected error when killing"); 
	    }).catch(function(e) {
	    	assert.equal(e.message, vmExceptionTextRevert);
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
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("throws an error when killed with invalid value", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var transferAmount = 101; //(expects 100)	    

	    return testContract.spend.sendTransaction(accounts[4], transferAmount, V1, R1, S1, V3, R3, S3).then(function(instance) { 
	    	assert(false, "Expected error when killing"); 
	    }).catch(function(e) {
	    	assert.equal(e.message, vmExceptionTextRevert);
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
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("throws an error when killed with correct message signed by wrong account", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])

	    // TODO: re-sign this
	    // correct message, signed with m/44'/6266'/1'/0/0
	    wrongR3 = 0xf1eb55bb4bd6602ebab1c927e0f24807a6703767965f3394ba772ae7166702bf;
            wrongS3 = 0x5e3d5bdf9e7243ba3683918360b6939f38ed2ee87684e5c36022e01b58152363;
	    wrongV3 = 0x01;
	    return testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1,  wrongV3, wrongR3, wrongS3).then(function(instance) { 
	    	assert(false, "Expected error when killing"); 
	    }).catch(function(e) {
	    	assert.equal(e.message, vmExceptionTextRevert);
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
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract)
	});
    });

    if (firstInvocation(accounts)) {
	it("throws error when killed with wrong destination", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    
	    badDestination = accounts[5]

	    return testContract.spend.sendTransaction(badDestination, firstSpend, V1, R1, S1, V3, R3, S3).then(function(instance) { 
	    	assert(false, "Expected error when killing"); 
	    }).catch(function(e) {
	    	assert.equal(e.message, vmExceptionTextRevert);
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
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract);
	});
    });

    if (firstInvocation(accounts)) {
	it("has an incremented spendNonce value", function() {
	    return testContract.spend.sendTransaction(accounts[4],
						      firstSpend,
						      V1,
						      R1,
						      S1,
						      V3,
						      R3,
						      S3)
		.then(function(instance) {
   		    return testContract.spendNonce.call().then(function(nonce) {
		        assert.equal(nonce, 1);
		    });
		});
	});
    }
});
																				       
contract('When already spent once', function(accounts) {

    var testContract;

    beforeEach(function() {
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract);
	});
    });

    if (firstInvocation(accounts)) {
	it("returns the expected message to sign", function() {
	    return testContract.spend.sendTransaction(accounts[4],
						      firstSpend,
						      V1,
						      R1,
						      S1,
						      V3,
						      R3,
						      S3)
		.then(function(instance) {	    
		    return testContract.generateMessageToSign.call(accounts[5], secondSpend).then(function(message) {
			assert.equal(message,"0x9bd9f4b563191943c9008219a2279fccf4d38eafe5e01e6fdfcf4097a2a2d727");
		    });
		});
	});
    }
});

contract('When already spent once', function(accounts) {

    var testContract;

    beforeEach(function() {
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract);
	    testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V3, R3, S3).then(function(instance) {
		return true;
	    });
	});
    });

    if (firstInvocation(accounts)) {
	it("can be spent by signed messages from the 1st & 2nd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[5])	    

	    return testContract.spend.sendTransaction(accounts[5], secondSpend, V1_1, R1_1, S1_1, V2_1, R2_1, S2_1).then(function() {
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
	return MultiSig2of3.new(address1, address2, address3).then(function(instance) {
	    testContract = instance;
	    makeDeposit(accounts, testContract);
	    testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V3, R3, S3).then(function(instance) {
		return true;
	    });
	});
    });

    if (firstInvocation(accounts)) {
	it("cannot be spent by previously valid signed messages from the 1st & 2nd owners", function() {
	    var startingDestinationBalance = web3.eth.getBalance(accounts[4])
	    var expectedContractBalance = deposit - firstSpend
            

	    return testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V2, R2, S2).then(function() {
	    	assert(false, "Expected error when spending"); 
	    }).catch(function(e) {
	    	assert.equal(e.message, vmExceptionTextRevert);
	    	assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedContractBalance.toString());
	    	var expectedTransfer = new web3.BigNumber(firstSpend)
	    	var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
	    	assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
	    });
	});
    }
});
