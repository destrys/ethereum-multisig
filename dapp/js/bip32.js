//
// == BIP32 Path ==
//

var BIP32_REGEXP        = /^m(\/\d+\'?)+$/;
var BIP32_REGEXP_LEDGER = /^m\/44'\/(60|1)'/;

function validateBIP32Path(path, walletType) {
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
	    if (walletType == "Ledger" && (! BIP32_REGEXP_LEDGER.test(path))) {
		return {
		    valid: false,
		    message:  "The Ledger Ethereum app only supports BIP32 paths beginning with m/44'/60' or m/44'/1'"
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

function runBIP32Check(walletAccount) {
    var walletType  = walletAccount.find('.wallet-account-hardware-wallet').val();
    var input       = walletAccount.find('input.wallet-account-bip32-path');
    var path        = input.val();
    var check       = validateBIP32Path(path, walletType);
    if (check.valid) {
	walletAccount.find('.wallet-account-form').find('button').prop('disabled', false);
	// var signerInput = signer.find('.signer-address-input');
	// if (signerInput.val() && signerInput.val().length > 0) { signerInput.change(); }
	input.addClass('is-valid');
	input.removeClass('is-invalid');
	input.closest('.form-group').find('.text-danger').html('');
    } else {
	walletAccount.find('.wallet-account-form').find('button').prop('disabled', true);
	input.addClass('is-invalid');
	input.removeClass('is-valid');
	input.closest('.form-group').find('.text-danger').html(check.message);
    }
}

function enableBIP32InputFeedback(input, field) {
    input.on("input", function(event) {
	$(this).closest('form').find('.trezor-errors').html('');
	runBIP32Check($(this).closest('.wallet-account'));
    });
}

function enableWalletSelector(select, field) {
    select.on("input", function(event) {
	var walletAccount = $(this).closest('.wallet-account');
	var path      = walletAccount.find('.wallet-account-bip32-path').val();
	var protocol  = window.location.protocol;
	if (event.target.value === 'Ledger') {
            $(this).closest('form').find('.ledger-info').prop('hidden', false);
	    $(this).closest('form').find('.trezor-info').prop('hidden', true);
	    if (protocol === 'http:') {
	        $(this).closest('form').find('.ledger-warning-http').prop('hidden', false);
	    }
	    runBIP32Check(walletAccount, "Ledger");
	    $(this).closest('form').find('.spend-message-trezor-wrapper').prop('hidden', true);
	    $(this).closest('form').find('.spend-message-ledger-wrapper').prop('hidden', false);
	} else {
            $(this).closest('form').find('.ledger-info').prop('hidden', true);
	    $(this).closest('form').find('.trezor-info').prop('hidden', false);
	    $(this).closest('form').find('.ledger-warning-http').prop('hidden', true);
	    runBIP32Check(walletAccount, "Trezor");
	    $(this).closest('form').find('.spend-message-trezor-wrapper').prop('hidden', false);
	    $(this).closest('form').find('.spend-message-ledger-wrapper').prop('hidden', true);
	}
    });
}

$(function () {
    enableBIP32InputFeedback($('.wallet-account .wallet-account-bip32-path'));
    enableWalletSelector($('.wallet-account .wallet-account-hardware-wallet'));
})
