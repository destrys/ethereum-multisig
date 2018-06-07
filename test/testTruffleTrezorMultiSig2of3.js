var contract_utils = require("../src/contract_utils");

const ec = new require('elliptic').ec('secp256k1');
const keccak_256 = require('js-sha3').keccak_256;

var TrezorMultiSig2of3 = artifacts.require("TrezorMultiSig2of3");

var deposit = 1000; // wei
var firstSpend = 100;
var secondSpend = 900;

// These are the private keys from the default truffle dev environment
// we need them to be able to sign messages.
var privateKeys = [
    'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
    'ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
    '0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1',
    'c88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c',
    '388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418',
    '659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63',
    '82d052c865f5763aad42add438569276c00d3d88a2d062d36b2bae914d58b8c8',
    'aa3680d5d48a8283413f7a108367c7299ca73f553735860a87b08f39395618b7',
    '0f62d96d6675f32685bbdb8ac13cda7c23436f63efbb9d07700d8669ff12b7c4',
    '8d5366123cb560bb606379f90a0bfd4769eecc0557f1b362dcae9012b548b1e5'
];


// Expected Error test for a failed require()
var vmExceptionText = "VM Exception while processing transaction: revert";

// returns an r,s,v signing triplet for a message.
function signMessageTrezor(keyIndex, message) {
    const msg = "\x19Ethereum Signed Message:\n\x40" + message.slice(2)
    const h = keccak_256(Buffer.from(msg))
        
    key = ec.keyFromPrivate(privateKeys[keyIndex])
    const sig = key.sign(h)

    return {
        v: sig.recoveryParam,
        r: '0x' + sig.r.toString('hex'),
        s: '0x' + sig.s.toString('hex')
    }
}

async function makeDeposit(accounts, testContract) {
    return await web3.eth.sendTransaction({from: accounts[0], to: testContract.address, value: deposit});
}


contract('When constructing', function(accounts) {
    it("raises an error without any arguments", async () => {
        try {
            await TrezorMultiSig2of3.new()
            assert(false, "Expected error in constructor")
        } catch (e) {
            assert.equal(e.message, "TrezorMultiSig2of3 contract constructor expected 3 arguments, received 0")
        }
    });
    
    it("raises an error with a single argument", async () => {
        try {
            await TrezorMultiSig2of3.new(accounts[1]);
            assert(false, "Expected error in constructor");
        } catch (e) {
            assert.equal(e.message, "TrezorMultiSig2of3 contract constructor expected 3 arguments, received 1");
        }
    });
    
    it("raises an error with only two arguments", async () => {
        try {
            await TrezorMultiSig2of3.new(accounts[1], accounts[2]);
            assert(false, "Expected error in constructor");
        } catch (e) {
            assert.equal(e.message, "TrezorMultiSig2of3 contract constructor expected 3 arguments, received 2");
        }
    });
    
    it("raises an error with three arguments when the first two are duplicates", async () => {
        try {
            await TrezorMultiSig2of3.new(accounts[1], accounts[1], accounts[2]);
            assert(false, "Expected error in constructor");
        } catch (e) {
            assert.equal(e.message, vmExceptionText);
        }
    });
    
    it("raises an error with three arguments when the last two are duplicates", async () => {
        try {
            await TrezorMultiSig2of3.new(accounts[1], accounts[3], accounts[3]);
            assert(false, "Expected error in constructor");
        } catch (e) {
            assert.equal(e.message, vmExceptionText);
        }
    });
    
    it("raises an error with three arguments when the first and third are duplicates", async () => {
        try {
            await TrezorMultiSig2of3.new(accounts[1], accounts[3], accounts[3]);
            assert(false, "Expected error in constructor");
        } catch (e) {
            assert.equal(e.message, vmExceptionText);
        }
    });
    
    it("does not raise error with three distinct arguments", async () => {
        const newMSig = await TrezorMultiSig2of3.new(accounts[1], accounts[2], accounts[3]);
        assert(newMSig, 'expected contract instance to not be null')
    });
});

contract('When first created', function(accounts) {
    let testContract;
    
    beforeEach( async () => {
        testContract = await TrezorMultiSig2of3.new(accounts[1], accounts[2], accounts[3]);
    });
    
    it("has a zero spendNonce value", async () => {
        assert.equal( 0, await testContract.spendNonce(), 'expected spendNoce to start at 0')
    });
    
    it("has a correct Major Version value", async () => {
        assert.equal(1, await testContract.unchainedMultisigVersionMajor())
    });
    
    it("has a correct Minor Version value", async () => {
        assert.equal(0, await testContract.unchainedMultisigVersionMinor())
    });
    
    it("can accept funds", async () => {
        await makeDeposit(accounts, testContract);
        assert.equal( web3.eth.getBalance(testContract.address).toNumber(), deposit);
    });
    
    it("emits a 'Funded' event when accepting funds", async () => {
        const result = await testContract.sendTransaction({ from: accounts[0], to: testContract.address, value: deposit})
        assert(result.logs[0].event, 'Funded');
        assert(result.logs[0].args.new_balance.toString(), deposit.toString());
    });
    
    it("returns the expected message to sign", async () => {
        const message = await testContract.generateMessageToSign.call(accounts[4], firstSpend);
        // The value of the message changes with the address of the contract, we'll just make
        // sure its returning something
        assert(message);
    });
    
    it("raises an error when using the contract address as a destination in the message to sign", async () => {
        try {
            await testContract.generateMessageToSign(testContract.address, firstSpend)
            assert(false, 'vmExceptonText');
        } catch (e) {
            assert.equal(e.message, vmExceptionText);
        }
    });
});


async function setup(accounts) {
    try {
        const testContract = await TrezorMultiSig2of3.new(accounts[1], accounts[2], accounts[3]);
        await makeDeposit(accounts, testContract)	    

        const unsignedMessage = await testContract.generateMessageToSign(accounts[4], firstSpend)
        const s = await Promise.all([0,1,2,3].map( (i) => signMessageTrezor(i, unsignedMessage) ));    
        const startingDestinationBalance = web3.eth.getBalance(accounts[4])
        return {testContract, s, unsignedMessage, startingDestinationBalance};
    } catch (e) {
        assert(false, e.message)
    }
}

contract('When already funded', (accounts) => {        
    it("can accept funds", async () => {
        const {testContract, s, unsignedMessage, startingDestinationBalance} = await setup(accounts);
        await makeDeposit(accounts, testContract);
        assert.equal(web3.eth.getBalance(testContract.address).toNumber(), deposit * 2);
    });
});
contract('When already funded', (accounts) => {        
    it("emits a 'Funded' event when accepting funds", async () => {
        const {testContract, s, unsignedMessage, startingDestinationBalance} = await setup(accounts);
        const result = await testContract.sendTransaction({from: accounts[0], to: testContract.address, value: deposit})
        assert.equal(result.logs[0].event, "Funded");
        assert.equal(result.logs[0].args.new_balance.toNumber(), deposit * 2);
    });
});
contract('When already funded', (accounts) => {        
    it('generates messages to sign', async ()=>{
        const {testContract, s, unsignedMessage, startingDestinationBalance} = await setup(accounts);

        assert(unsignedMessage)
    });
});
for(let i=1; i<=3; i++) {
    let j = (i%3) + 1;
    contract('When already funded', (accounts) => {        
        it(`can be spent by signed messages from the ${i} & ${j} owners`, async () => {
            try {
                const {testContract, s, unsignedMessage, startingDestinationBalance} = await setup(accounts);
                const expectedBalance = deposit - firstSpend
                try {
                await testContract.spend(accounts[4], firstSpend, s[i].v, s[i].r, s[i].s, s[j].v, s[j].r, s[j].s);
                }  catch(e) {assert(false, e.message)}
                assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
                const expectedTransfer = new web3.BigNumber(firstSpend)
                const increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
                assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
            } catch (e) {
                assert(false, e.message)
            }
        });
    });
}
contract('When already funded', (accounts) => {        
    it("emits a 'Spent' event when it is correctly spent", async () => {
        try {
        const {testContract, s, unsignedMessage, startingDestinationBalance} = await setup(accounts);
        const expectedBalance = deposit - firstSpend
        
        const result = await testContract.spend(accounts[4], firstSpend, s[1].v, s[1].r, s[1].s, s[2].v, s[2].r, s[2].s);
        assert.equal(result.logs[0].event, "Spent");
        assert.equal(result.logs[0].args.to, accounts[4]);
        assert.equal(result.logs[0].args.transfer.toString(), firstSpend.toString());
        } catch (e) {
            assert(false, e.message)
        }
    });
});
contract('When already funded', (accounts) => {        
    it("throws an error when killed with invalid messages", async () => {            
        const {testContract, s, unsignedMessage, startingDestinationBalance} = await setup(accounts);
        let bad_s3_r = s[3].r
        if(bad_s3_r.slice(2,3) == '0') {
            bad_s3_r = '0x1' + bad_s3_r.slice(3);
        } else {
            bad_s3_r = '0x0' + bad_s3_r.slice(3);
        }

        try {
            await testContract.spend(accounts[4], firstSpend, s[1].v, s[1].r, s[1].s, s[3].v, bad_s3_r, s[3].s)
            assert(false, "Expected error when killing"); 
        } catch (e) {
            assert.equal(e.message, vmExceptionText);
            assert.equal(web3.eth.getBalance(testContract.address).toString(), deposit.toString());
            var expectedTransfer = new web3.BigNumber(0)
            var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
            assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
        }
    });
});
contract('When already funded', (accounts) => {        
    it("throws an error when killed with invalid transfer value", async () => {
        const {testContract, s, unsignedMessage, startingDestinationBalance} = await setup(accounts);
        const badValue = 101;            
        try {
            await testContract.spend(accounts[4], badValue, s[1].v, s[1].r, s[1].s, s[3].v, s[3].r, s[3].s)
            assert(false, "Expected error when killing"); 
        } catch (e) {
            assert.equal(e.message, vmExceptionText);
            assert.equal(web3.eth.getBalance(testContract.address).toString(), deposit.toString());
            var expectedTransfer = new web3.BigNumber(0)
            var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
            assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
        }
    });
});
contract('When already funded', (accounts) => {        
    it("throws an error when killed with correct message signed by wrong account", async () => {            
        const {testContract, s, unsignedMessage, startingDestinationBalance} = await setup(accounts);
        try {
            await testContract.spend(accounts[4], 101, s[0].v, s[0].r, s[0].s, s[3].v, s[3].r, s[3].s)
            assert(false, "Expected error when killing"); 
        } catch (e) {
            assert.equal(e.message, vmExceptionText);
            assert.equal(web3.eth.getBalance(testContract.address).toString(), deposit.toString());
            var expectedTransfer = new web3.BigNumber(0)
            var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
            assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
        }
    });
});
contract('When already funded', (accounts) => {        
    it("throws an error when killed with the wrong destination", async () => {            
        const {testContract, s, unsignedMessage, startingDestinationBalance} = await setup(accounts);
        try {
            await testContract.spend(accounts[0], firstSpend, s[1].v, s[1].r, s[1].s, s[3].v, s[3].r, s[3].s)
            assert(false, "Expected error when killing"); 
        } catch (e) {
            assert.equal(e.message, vmExceptionText);
            assert.equal(web3.eth.getBalance(testContract.address).toString(), deposit.toString());
            var expectedTransfer = new web3.BigNumber(0)
            var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
            assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
        }
    });    
});


async function setup2(accounts) {
    try {
        const testContract = await TrezorMultiSig2of3.new(accounts[4], accounts[5], accounts[6]);
        await makeDeposit(accounts, testContract)	    

        const firstUnsignedMessage = await testContract.generateMessageToSign(accounts[4], firstSpend)
        // after we spend with the signatures, they become stale
        const stale = await Promise.all([0,4,5,6].map( (i) => signMessageTrezor(i, firstUnsignedMessage) ));    
        const startingDestinationBalance = web3.eth.getBalance(accounts[5])
        try {
        await testContract.spend(accounts[4], firstSpend, stale[1].v, stale[1].r, stale[1].s, stale[2].v, stale[2].r, stale[2].s);
        } catch(e) {
            console.log(e)
        }
        const unsignedMessage =  await testContract.generateMessageToSign.call(accounts[5], secondSpend);
        const s = await Promise.all([0,4,5,6].map( (i) => signMessageTrezor(i, unsignedMessage) ));     

        return {testContract, s, unsignedMessage, startingDestinationBalance, stale, firstUnsignedMessage};
    } catch (e) {
        assert(false, e.message)
    }
}

contract('When already spent once', function(accounts) {        
    it("has an incremented spendNonce value", async () => {
        const {testContract, s, unsignedMessage, startingDestinationBalance, stale, firstUnsignedMessage} = await setup2(accounts); 
        const nonce = await testContract.spendNonce();
        assert.equal(nonce, 1);
    });
});
contract('When already spent once', function(accounts) {            
    it("returns the expected message to sign", async () => {
        const {testContract, s, unsignedMessage, startingDestinationBalance, stale, firstUnsignedMessage} = await setup2(accounts); 
        assert(unsignedMessage)
    });
});
for(let i=1; i<=0; i++) {
    let j = (i%3) + 1;
contract('When already spent once', function(accounts) {            
        it(`can be spent by signed messages from the ${i} & ${j} owners`, async () => {
            const {testContract, s, unsignedMessage, startingDestinationBalance, stale, firstUnsignedMessage} = await setup2(accounts); 
            try {
            const expectedBalance = deposit - firstSpend - secondSpend;
            await testContract.spend(accounts[5], secondSpend, s[i].v, s[i].r, s[i].s, s[j].v, s[j].r, s[j].s);
            
            assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
            const expectedTransfer = new web3.BigNumber(secondSpend)
            const increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
                
            assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
        } catch (e) {
            assert(false, e.message)
        }
        });
});
}
contract('When already spent once', function(accounts) {                
    it("cannot be spent by previously valid signed messages from the 1st & 2nd owners",async () => {
        const {testContract, s, unsignedMessage, startingDestinationBalance, stale, firstUnsignedMessage} = await setup2(accounts); 
        const expectedContractBalance = deposit - firstSpend
        const account4start = web3.eth.getBalance(accounts[4]);
        try {
            await testContract.spend.sendTransaction(accounts[4], firstSpend, stale[1].v, stale[1].r, stale[1].s, stale[2].v, stale[2].r, stale[2].s)
            assert(false, "Expected error when spending"); 
        } catch(e) {
            assert.equal(e.message, vmExceptionText);
            assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedContractBalance.toString());

            var expectedTransfer = new web3.BigNumber(0)
            var increaseInDestination = web3.eth.getBalance(accounts[4]).minus(account4start)

            assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
        }
    });
});

