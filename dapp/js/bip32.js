//
// == BIP32 Path ==
//

var BIP32_REGEXP = /^m(\/\d+\'?)*\/\d+$/

function validateBIP32Path(path) {
    if (path && path.length > 0) {
	if (BIP32_REGEXP.test(path)) {
	    var indices = path.replace(/'/g,"").split('/').slice(1).map(x => parseInt(x));
	    for (var i = 0; i < indices.length; i ++) {
		if (indices[i] >= Math.pow(2,31)) {
		    return {
			valid: false,
			message: "BIP32 indices must be less than 2^31"}
		}
	    }
            return { valid: true }
	} else {
	    return {
		valid: false,
		message: "BIP32 path must be valid"
	    }
	}
    } else {
	return {
	    valid:   false,
	    message: "BIP32 path is required."
	}
    }	    	
}

var BIP32_LEDGER_REGEXP = /^m\/44|1\'\/60|61\'(\/\d+\'?)*\/\d+$/

function validateLedgerBIP32Path(path) {
    if (path && path.length > 0) {
	if (BIP32_LEDGER_REGEXP.test(path)) {
            return { valid: true }
	} else {
	    return {
		valid: false,
	    }
	}
    } else {
	return {
	    valid:   false,
	}
    }	    	
}


function enableBIP32InputFeedback(input, field) {
    input.on("input", function(event) {
	$(this).closest('form').find('.trezor-errors').html('');
	var check       = validateBIP32Path(event.target.value);
 	var ledgerCheck = validateLedgerBIP32Path(event.target.value);	
	var signerNew = $(this).closest('.signer-new');
        var walletType = signerNew.find('.signer-hardware-wallet').val();	
	if (check.valid) {
	    signerNew.find('.export-signer-address-form').find('button').prop('disabled', false);
	    var signerInput = signerNew.find('.signer-address-input');
	    if (signerInput.val() && signerInput.val().length > 0) { signerInput.change(); }
	    $(this).addClass('is-valid');
	    $(this).removeClass('is-invalid');
	    $(this).closest('.form-group').find('.text-danger').html('');
	    if (walletType === 'Ledger') {
   	        if (ledgerCheck.valid) {
		    $(this).closest('form').find('.ledger-warning').html('');
		} else {
		    var ledgerStr = "Warning: The standard Ledger ethereum app\
                        currently only supports BIP32 paths that begin with\
                        m/44'/60' or m/44'/1'";
	            $(this).closest('form').find('.ledger-warning').html(ledgerStr);
		}
	    }	
	} else {
	    signerNew.find('button').prop('disabled', true);
	    $(this).addClass('is-invalid');
	    $(this).removeClass('is-valid');
	    $(this).closest('.form-group').find('.text-danger').html(check.message);
	}
    });
}

function walletSelectorFeedback(select, field) {
    select.on("input", function(event) {
	var signerNew = $(this).closest('.signer-new');
	var path = signerNew.find('.signer-bip32-path').val();
 	var check = validateLedgerBIP32Path(path);
	if (event.target.value === 'Ledger' && !check.valid) {
	    var ledgerStr = "Warning: The standard Ledger ethereum app\
                currently only supports BIP32 paths that begin with\
                m/44'/60' or m/44'/1'";
	    $(this).closest('form').find('.ledger-warning').html(ledgerStr);
	} else {
	    $(this).closest('form').find('.ledger-warning').html('');
	}
    });
}



$(function () {
    enableBIP32InputFeedback($('.signer .signer-bip32-path'));
    walletSelectorFeedback($('.signer .signer-hardware-wallet'));
})
