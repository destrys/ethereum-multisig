//
// == Find & Validate Vault Contract ==
//

var MAJOR_VERSION = "2";
var MINOR_VERSION = "0";
var VERSION       = [MAJOR_VERSION, MINOR_VERSION].join('.');

function enableFindVaultAddressInputFeedback() {
    $('#find-vault-address-input').on("input", function(event) {
	var address  = event.target.value;
	var check    = validateAddress(address);
	if (check.valid) {
	    $(this).closest('form').find('button').prop('disabled', false);
	    $(this).addClass('is-valid');
	    $(this).removeClass('is-invalid');
	    $(this).closest('.form-group').find('.text-danger').html('');
	} else {
	    $(this).closest('form').find('button').prop('disabled', true);
	    $(this).addClass('is-invalid');
	    $(this).removeClass('is-valid');
	    $(this).closest('.form-group').find('.text-danger').html(check.message);
	}
    });
}

function ensureAddressIsSpendableVault(address, callback, errback) {
    connectionAlive(
	function() {
	    ensureAddressIsContract(
		address,
		function() {
		    ensureContractVersionIsCompatible(
			address,
			function(version) {
			    getAddressBalance(
				address,
				function(balance) {
				    if (balance > 0) {
					callback(version, balance);
				    } else {
					errback("Address has zero balance.")
				    }
				},
				errback
			    );
			},
			errback
		    );
		},
		errback
	    );
	},
	errback
    );
}

function ensureAddressIsContract(address, callback, errback) {
    WEB3.eth.getCode(
	address,
	function(codeError, code) {
	    if (codeError) { 
		console.error(codeError);
		errback(codeError);
	    } else {
		if (code != "0x") {
		    callback();
		} else {
		    errback("Address is not a contract");
		}
	    }
	});
}

function ensureContractVersionIsCompatible(address, callback, errback) {
    WEB3.eth.contract(MultiSig2of3Compiled.abi).at(
	address, 
	function(contractError, contract) {
	    if (contractError) {
		console.error(contractError);
		errback(contractError);
	    } else {
		contract.unchainedMultisigVersionMajor.call(function(majorErr, major) {
		    if (majorErr) {
			console.error(majorErr);
			errback(majorErr);
		    } else {
			contract.unchainedMultisigVersionMinor.call(function(minorErr, minor) {
			    if (minorErr) {
				console.error(minorErr);
				errback(minorErr);
			    } else {
				var version = major.toString() + "." + minor.toString();
				if (major.toString() == MAJOR_VERSION) {
				    callback(version);
				} else {
				    errback("Contract version " + version + " is not compatible with this application.");
				}
			    }
			});
		    }
		});
	    }
	});
}

function enableFindVaultForm() {
    $("#find-vault-form").submit(function(event) {
	event.preventDefault();
	var address = $('#find-vault').find('input').val().toLowerCase();
	var errors  = $('#find-vault').find('.vault-address-errors')
	errors.html('');
	ensureAddressIsSpendableVault(
	    address,
	    function(version, balance) {
		$('#author-spend-source-address-input').val(address);
		$('.spend-source-address').html(address);
		$('.spend-source-version').html(version);
		$('.spend-source-balance').html(balance);
		$("#find-vault").prop('hidden', true);
		$('#author-spend').prop('hidden', false);
	    },
	    function(err) {
		errors.html(err);
	    }
	);
    });
}

//
// == Create Transaction ==
//

// TODO: Verify signature addresses are actually owners of the contract

function enableAuthorSpendAddressInputFeedback() {
    $('#spend-destination-address-input').on("input", function(event) {
	var address  = event.target.value;
	var check    = validateAddress(address);
	if (address.toLowerCase() == $('#author-spend-source-address-input').val().toLowerCase()) {
	    check.valid   = false;
	    check.message = "Destination address cannot equal source address.";
	}
	if (check.valid) {
	    $(this).closest('form').find('button').prop('disabled', false);
	    $(this).addClass('is-valid');
	    $(this).removeClass('is-invalid');
	    $(this).closest('.form-group').find('.text-danger').html('');
	} else {
	    $(this).closest('form').find('button').prop('disabled', true);
	    $(this).addClass('is-invalid');
	    $(this).removeClass('is-valid');
	    $(this).closest('.form-group').find('.text-danger').html(check.message);
	}
    });
}

function validateAmount(amount, balance) {
    var amount = parseFloat(amount);
    var balance = parseFloat(balance);
    if (amount <= balance) {
	if (amount > 0) {
	    return {valid: true};
	} else {
	    return {
		valid: false,
		message: "Amount must be greater than zero."
	    };
	}
    } else {
	return {
	    valid: false,
	    message: "Amount must be less than or equal to current balance."
	};
    }
}

function enableAmountInputFeedback() {
    $('#spend-amount-input').on("input", function(event) {
	var thisAmount = event.target.value;
	var balance    = $('#author-spend').find('.spend-source-balance').html();
	var check      = validateAmount(thisAmount, balance);
	if (check.valid) {
	    $(this).closest('form').find('button').prop('disabled', false);
	    $(this).addClass('is-valid');
	    $(this).removeClass('is-invalid');
	    $(this).closest('.form-group').find('.text-danger').html('');
	} else {
	    $(this).closest('form').find('button').prop('disabled', true);
	    $(this).addClass('is-invalid');
	    $(this).removeClass('is-valid');
	    $(this).closest('.form-group').find('.text-danger').html(check.message);
	}
    });
}

function getMessageToSign(source, destination, amount, callback, errback) {
    connectionAlive(
	function() {
	    WEB3.eth.contract(MultiSig2of3Compiled.abi).at(
		source, 
		function(contractError, contract) {
		    if (contractError) {
			console.error(contractError);
			errback(contractError);
		    } else {
			contract.generateMessageToSign.call(
			    destination, 
			    ethToWei(parseFloat(amount)), 
			    function(messageError, message) {
				if (messageError) {
				    console.error(messageError);
				    errback(messageError);
				} else {
				    console.log("MESSAGE TO SIGN:", message);
				    callback(message);
				}
			    }
			);
		    }
		}
	    );
	},
	errback
    );
}

function ledgerDisplay(message) {
    let hash = shajs('sha256').update(message).digest('hex');
    let first4 = hash.substring(0,4).toUpperCase();
    let last4 = hash.substring(hash.length-4, hash.length).toUpperCase();
    return first4 + "..." + last4
}
// AB1A...23BA

// TODO: calculate pre-hash of message
function enableAuthorSpendForm() {
    $("#author-spend-form").submit(function(event) {
	event.preventDefault();
	var source      = $('#author-spend-source-address-input').val();
	var destination = $('#spend-destination-address-input').val();
	var amount      = $('#spend-amount-input').val();
	var balance     = $('#spend-source-address-balance').val();
	getMessageToSign(
	    source, destination, amount,
	    function(message) {
		let displayMessage = message.slice(2)
		$('#author-spend-errors').html('');
		$('.spend-source-address').html(source);
		$('.spend-destination-address').html(destination);
		$('.spend-amount').html(amount);
		$('#spend-message-trezor').html(displayMessage);
		$('#spend-message-ledger').html(ledgerDisplay(displayMessage));
		$("#author-spend").prop('hidden', true);
		$("#spend").prop('hidden', false);
		$('.signature').prop('hidden', false);
	    },
	    function(error) {
		$('#author-spend-errors').html(error);
	    });
    });
}

//
// == Signatures ==
//

function enableSignMessageForms() {
    $("form.extract-signer-signature-form").submit(function(event) {
	event.preventDefault();
	var form = $(this);
	var wallet = form.find('select.signer-hardware-wallet').val()	
	var message = $('#spend-message-trezor').html();
	var minimumTrezorFirmware = "1.6.2"	
	if (wallet == 'Trezor') {	
     	    TrezorConnect.ethereumSignMessage({
                path: form.find('input.signer-bip32-path').val(),
                message: message
            }).then(function(result) {
		if (result.success) {
                    let payload = result.payload;
		    console.info("Successfully signed message: ", payload);
		    activateSignature(form.closest('.signature'), payload);
		    // parse signature into r,s,v
		} else {
		    console.error(result.payload.error);
		    form.find('.trezor-errors').html(result.payload.error);
		}
	    }, minimumTrezorFirmware);
	} else if (wallet == 'Ledger') {
	    var ledgerMessage = stringToHex(message)
            TransportU2F.create().then(transport => {
                var ledgereth = new LedgerEth(transport);
	    	ledgereth.signPersonalMessage(form.find('input.signer-bip32-path').val(), ledgerMessage).then(function(result) {
		    console.info("Successfully signed message: ", result);
		    activateLedgerSignature(form.closest('.signature'), result);
	        }, function(reason) {
		    console.error(reason);
		    form.find('.trezor-errors').html("There was an ledger error: " + reason.message);
	        });
	    });
	}
    });
}

function stringToHex (tmp) {
    var str = '',
        i = 0,
        tmp_len = tmp.length,
        c;
 
    for (; i < tmp_len; i += 1) {
        c = tmp.charCodeAt(i);
        str += c.toString(16);
    }
    return str;
}


function extractR(signature) {
    return "0x" + signature.substring(0,64)
}

function extractS(signature) {
    return "0x" + signature.substring(64, 128)
}

function extractV(signature) {
    var v = signature.substring(128,130)
    if (v == "1b") {
	return "0x00"
    }
    if (v == "1c") {
	return "0x01"
    }
    console.error("V not a known value");
    return "error"
}

function extractLedgerV(v) {
    if (v == 28) {
	return "0x01"
    }
    if (v == 27) {
	return "0x00"
    }
    console.error("V not a known value");
    return "error"
}
//
// == Signature Management ==
//

function activateSignature(signature, message) {
    var signatureNew      = signature.find('.signature-new');
    var bip32path         = signatureNew.find('input.signer-bip32-path');        
    var enteredSignature  = signatureNew.find('input.signature-input');
    signatureNew.prop('hidden',  true);

    if (message) {
	var signatureShow = signature.find('.signature-show-local');
	signatureShow.find('.signature-full').html(message.signature);
	signatureShow.find('.signature-r').html(extractR(message.signature));
	signatureShow.find('.signature-s').html(extractS(message.signature));
	signatureShow.find('.signature-v').html(extractV(message.signature));
	signatureShow.find('.signature-bip32-path').html(bip32path.val());	
    } else {
	var signatureShow = signature.find('.signature-show-remote');
	signatureShow.find('.signature-full').html(enteredSignature.val());
	signatureShow.find('.signature-r').html(extractR(enteredSignature.val()));
	signatureShow.find('.signature-s').html(extractS(enteredSignature.val()));
	signatureShow.find('.signature-v').html(extractV(enteredSignature.val()));	
    }

    enteredSignature.val('');

    signatureShow.prop('hidden', false);

    setAddedSignatureCount();
}

function activateLedgerSignature(signature, message) {
    var signatureNew      = signature.find('.signature-new');
    var bip32path         = signatureNew.find('input.signer-bip32-path');        
    var enteredSignature  = signatureNew.find('input.signature-input');
    signatureNew.prop('hidden',  true);

    if (message) {
	var signatureShow = signature.find('.signature-show-local');
	signatureShow.find('.signature-full').html(message.r + message.s + message.v);
	signatureShow.find('.signature-r').html("0x" + message.r);
	signatureShow.find('.signature-s').html("0x" + message.s);
	signatureShow.find('.signature-v').html(extractLedgerV(message.v));
	signatureShow.find('.signature-bip32-path').html(bip32path.val());
    } else {
	var signatureShow = signature.find('.signature-show-remote');
	signatureShow.find('.signature-full').html(enteredSignature.val());
	signatureShow.find('.signature-r').html(extractR(enteredSignature.val()));
	signatureShow.find('.signature-s').html(extractS(enteredSignature.val()));
	var tmpV = parseInt(enteredSignature.val().substring(128,130))
	signatureShow.find('.signature-v').html(extractLedgerV(tmpV));	
    }
    

    enteredSignature.val('');

    signatureShow.prop('hidden', false);

    setAddedSignatureCount();
}



function setAddedSignatureCount() {
    var count = addedSignatureCount();
    $("#spend-signature-count").html(count);
    if (count == 2) {
	$('#broadcast-spend-form').find('button').prop('disabled', false);
    } else {
	$('#broadcast-spend-form').find('button').prop('disabled', true);
    }
}

function addedSignatureCount() {
    return $('.signature-show').filter(function() {
	return ! $(this).prop('hidden');
    }).length;
}


function currentSignatures() {
    var r = $(".signature-r").map(function() {
	return $(this).text()
    }).toArray().filter(String);
    var s = $(".signature-s").map(function() {
	return $(this).text()
    }).toArray().filter(String);
    var v = $(".signature-v").map(function() {
	return $(this).text()
    }).toArray().filter(String);
    return {r: r, s: s, v: v}
}

function enableRemoveSignatureForms() {
    $(".signature-remove-form").submit(function(event) {
	event.preventDefault();
	var signatureNew  = $(this).closest('.signature').find('.signature-new');
	var signatureShow = $(this).closest('.signature-show');
	signatureShow.prop('hidden', true);
	signatureShow.find('.signature-full').html('');
	signatureShow.find('.signature-bip32-path').html('');
	signatureShow.find('.signature-r').html('');
	signatureShow.find('.signature-s').html('');
	signatureShow.find('.signature-v').html('');	
	signatureNew.prop('hidden',  false);
	setAddedSignatureCount();
    });
}

function enableEnterSignatureForms() {
    $("form.enter-signer-signature-form").submit(function(event) {
	event.preventDefault();
	var form = $(this);	
	var wallet = form.find('select.signer-hardware-wallet').val()
	if (wallet == 'Trezor') {
     	    activateSignature($(this).closest('.signature'));
	} else if (wallet == 'Ledger') {
	    activateLedgerSignature($(this).closest('.signature'));
	}
    });
}

//
// == Broadcast Spend ==
//

var SPEND_GAS_LIMIT = 1000000;

function broadcastSpend(callback, errback) {
    var source      = $('.spend-source-address').html();
    var destination = $('.spend-destination-address').html();
    var amount      = ethToWei(parseFloat($('.spend-amount').html()));
    var sigs        = currentSignatures();
    withValidAccount(
	function(account) {
	    WEB3.eth.contract(MultiSig2of3Compiled.abi).at(
		source, 
		function(contractErr, contract) {
		    if (contractErr) {
			console.error(contractErr);
			errback(contractErr);
		    } else {
			contract.spend.sendTransaction(
			    destination, 
			    amount, 
			    sigs.v[0], sigs.r[0], sigs.s[0], 
			    sigs.v[1], sigs.r[1], sigs.s[1], {
				from: account,
				gas: SPEND_GAS_LIMIT,
			    }, function(txError, txid) {
				if (txError) {
				    console.error(txError);
				    errback(txError);
				} else {
				    callback(txid);
				}
			    });
		    }
		});
	},
	errback
    );
}

function confirmSpend(txid, callback, errback) {
    connectionAlive(
	function() {
	    WEB3.eth.getTransactionReceipt(
                txid,
                function(err, response) {
                    if (err) {
                        console.error(contractErr);
                        errback(err);
                    } else if (response) {
                        if (response.status === "0x1") {
                            callback(response);
                        } else {
                            errback("Transaction Failed");
                        }
                    }
                }
            );
        }
    );
}


function enableBroadcastSpendForm() {
    $('#broadcast-spend-form').submit(function(event) {
	event.preventDefault();
	$('#broadcast-spend-errors').html('');
        $('#spend').prop('hidden', true);
	$('#pending-authorization').prop('hidden', false);
	broadcastSpend(
	    function(txid) {
		$('.spend-transaction-hash').html(txid);
		$('#pending-authorization').prop('hidden', true);
		$('#pending-confirmation').prop('hidden', false);
                // poll for confirmation or error
                let intervalID = null;
                let responded = null;
                intervalID = setInterval(
                    function() {
                        confirmSpend(
                            txid,
                            function(response) {
                                responded = response;
                                if (response) {
                                    console.log('RESPONSE', response);
                                    $('#pending-confirmation').prop('hidden', true);
                      		    $('#spend-success').prop('hidden', false);
                                }
                            },
                            function(error) {
                                responded = error;
                                console.log('ERROR', error);
                    		$('#pending-confirmation').prop('hidden', true);
                    		$('#spend-error').prop('hidden', false);
                            }
                        )
                        if (responded) {
                            clearInterval(intervalID);
                        }
                    }
                , 1500);
	    },
	    function(error) {
		$('#broadcast-spend-errors').html(error);
	    }
        );
    });
}

function enableModifySpendForm() {
    $("#modify-spend-form").submit(function(event) {
	event.preventDefault();
	$("#spend").prop('hidden', true);
	$("#author-spend").prop('hidden', false);
	$('.signature').prop('hidden', true);
	var signatureNews  = $('.signature-new');
	var signatureShows = $('.signature-show');
	signatureShows.prop('hidden', true);
	signatureShows.find('.signature-full').html('');
	signatureShows.find('.signature-bip32-path').html('');
	signatureShows.find('.signature-r').html('');
	signatureShows.find('.signature-s').html('');
	signatureShows.find('.signature-v').html('');	
	signatureNews.prop('hidden',  false);
	setAddedSignatureCount();
    });
}

$(function () {
    enableFindVaultForm();
    enableFindVaultAddressInputFeedback();
    enableAuthorSpendAddressInputFeedback();
    enableAmountInputFeedback();
    enableAuthorSpendForm();
    enableSignMessageForms();
    enableEnterSignatureForms();    
    enableRemoveSignatureForms();
    enableModifySpendForm();
    enableBroadcastSpendForm();
});
