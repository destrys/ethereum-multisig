//
// == Enter Signer Address ==
//

var deployedContract;

function validateSignerAddress(address) {
    var addressCheck = validateAddress(address);
    if (!addressCheck.valid) { return addressCheck; }
    
    if (currentSignerAddresses().includes(address)) {
	return {
	    valid:   false,
	    message: "This address is already a signer."
	}
    }
    return { valid: true }
}

function enableSignerAddressInputsFeedback() {
    $('.signer-address-input').on("input", function(event) {
	var check = validateSignerAddress(event.target.value);
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

function enableEnterSignerAddressForms() {
    $("form.enter-signer-address-form").submit(function(event) {
	event.preventDefault();
	activateSigner($(this).closest('.signer'));
    });
}

//
// == Export Signer Address ==
//

function enableExportSignerAddressForms() {
    $("form.export-signer-address-form").submit(function(event) {
	event.preventDefault();
	var form = $(this);
	var wallet = form.find('select.signer-hardware-wallet').val()
	if (wallet == 'Trezor') {
     	    TrezorConnect.ethereumGetAddress(form.find('input.signer-bip32-path').val(), function(result) {
       	        if (result.success) {
		    console.info("Successfully exported account info:", result);
		    var address = "0x"+result.address;
		    var check   = validateSignerAddress(address);
		    if (check.valid) {
		        form.find('.trezor-errors').html('');
		        activateSigner(form.closest('.signer'), address);
		    } else {
		        form.find('.trezor-errors').html(check.message);
		        form.find('button').prop('disabled', true);
		    }
	        } else {
		    console.error(result.error);
		    form.find('.trezor-errors').html(result.error);
	        }
	    });
        } else {
	    // TODO: Export address from Ledger
            console.log('LEDGER')
	}
    });
}


//
// == Signer Management ==
//

function currentSignerAddresses() {
    return $(".signer-address").map(function() {
	return $(this).text()
    }).toArray().filter(String);
}
		   


function activateSigner(signer, exportedAddress) {
    var signerNew      = signer.find('.signer-new');
    var bip32path      = signerNew.find('input.signer-bip32-path');    
    var enteredAddress = signerNew.find('input.signer-address-input');
    signerNew.prop('hidden',  true);
    enteredAddress.removeClass('is-valid');
    enteredAddress.removeClass('is-invalid');

    if (exportedAddress) {
	var signerShow = signer.find('.signer-show-local');
	signerShow.find('.signer-address').html(exportedAddress);
	signerShow.find('.signer-bip32-path').html(bip32path.val());
    } else {
	var signerShow = signer.find('.signer-show-remote');
	signerShow.find('.signer-address').html(enteredAddress.val());
    }

    enteredAddress.val('');

    signerShow.prop('hidden', false);

    setAddedSignerCount();
}

function enableRemoveSignerForms() {
    $(".signer-remove-form").submit(function(event) {
	event.preventDefault();
	var signerNew  = $(this).closest('.signer').find('.signer-new');
	var signerShow = $(this).closest('.signer-show');
	signerShow.prop('hidden', true);
	signerShow.find('.signer-address').html('');
	signerShow.find('.signer-bip32-path').html('');
	signerNew.prop('hidden',  false);
	setAddedSignerCount();
    });
}

function addedSignerCount() {
    return $('.signer-show').filter(function() {
	return ! $(this).prop('hidden');
    }).length;
}

function setAddedSignerCount() {
    var count = addedSignerCount();
    $("#signers-added-count").html(count);
    if (count == 3) {
	$('#create-vault-form').find('button').prop('disabled', false);
    } else {
	$('#create-vault-form').find('button').prop('disabled', true);
    }
}

//
// == Vault Creation ==
//

var CREATE_GAS_LIMIT = 1100000;

function enableCreateVaultForm() {
    $('#create-vault-form').submit(function(event) {
	event.preventDefault();
	$('#create-vault').find('.text-danger').html('');
	var pendingAuthorization = $('#pending-authorization');
	withValidAccount(
	    function(account) {
		// Begin to create contract...
		pendingAuthorization.find('button').prop('disabled', true);
		pendingAuthorization.find('.fa-spinner').prop('hidden', false);
		pendingAuthorization.find('.text-danger').html('');
		$('#create-vault').prop('hidden', true);
		pendingAuthorization.prop('hidden', false);
		var addresses = currentSignerAddresses();
		deployedContract = WEB3.eth.contract(TrezorMultiSig2of3Compiled.abi).new(addresses[0], addresses[1], addresses[2],{
		    data: TrezorMultiSig2of3Compiled.bytecode,
		    from: account,
		    gas:  CREATE_GAS_LIMIT,
		}, function(err, newContract) {
		    if (err) {
			// User rejected transaction or some other
			// error.
			var message = err.message.split("\n")[0];
			pendingAuthorization.find('.fa-spinner').prop('hidden', true);
			pendingAuthorization.find('.text-danger').html(message);
			pendingAuthorization.find('button').prop('disabled', false);
		    } else {
			if (newContract.address) {
			    // Transaction confirmed -- contract address now available
			    console.info('Transaction confirmed:', newContract);
			    $('.vault-address').html(newContract.address);
			    $('#pending-confirmation').prop('hidden', true);
			    $('#vault').prop('hidden', false);
			} else {
			    // Transaction broadcast -- transaction hash now available
			    console.info('Transaction broadcast:', newContract);
  			    $('.vault-transaction-hash').html(newContract.transactionHash);
			    pendingAuthorization.prop('hidden', true);
			    $('#pending-confirmation').prop('hidden', false);
			}
		    }
		});
	    }, 
	    function(err) {
		$('#create-vault').find('.text-danger').html(err);
	    });
    });
}

function enableRestartCreateVaultForm() {
    $('#restart-create-vault-form').submit(function(event) {
	event.preventDefault();
	$('#pending-authorization').prop('hidden', true);
	$('#create-vault').prop('hidden', false);
    });
}

$(function () {
    enableExportSignerAddressForms()
    enableSignerAddressInputsFeedback();
    enableEnterSignerAddressForms();
    enableRemoveSignerForms(); 
    enableCreateVaultForm();
    enableRestartCreateVaultForm();
});
