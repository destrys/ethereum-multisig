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


function enableBIP32InputFeedback(input, field) {
    input.on("input", function(event) {
	$(this).closest('form').find('.trezor-errors').html('');
	var check     = validateBIP32Path(event.target.value);
	var signerNew = $(this).closest('.signer-new');
	if (check.valid) {
	    signerNew.find('.export-signer-address-form').find('button').prop('disabled', false);
	    var signerInput = signerNew.find('.signer-address-input');
	    if (signerInput.val() && signerInput.val().length > 0) { signerInput.change(); }
	    $(this).addClass('is-valid');
	    $(this).removeClass('is-invalid');
	    $(this).closest('.form-group').find('.text-danger').html('');
	} else {
	    signerNew.find('button').prop('disabled', true);
	    $(this).addClass('is-invalid');
	    $(this).removeClass('is-valid');
	    $(this).closest('.form-group').find('.text-danger').html(check.message);
	}
    });
}


$(function () {
    enableBIP32InputFeedback($('.signer .signer-bip32-path'));
})
