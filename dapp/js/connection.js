//
// Details
//

function enableShowConnectionDetails() {
    $('#show-connection-details-link').click(function(event) {
	event.preventDefault();
	$(this).prop('hidden', true);
	$('#connection-details').prop('hidden', false);
    });
}

function enableHideConnectionDetails() {
    $('#hide-connection-details-link').click(function(event) {
	event.preventDefault();
	$('#connection-details').prop('hidden', true);
	$('#show-connection-details-link').prop('hidden', false)
    });
}

//
// URL
//

function connectionHost() {
    return $("#connection-host").val() || "localhost"
}

function connectionPort() {
    return $("#connection-port").val() || "8545"
}

function connectionURL() {
    return "http://" + connectionHost() + ":" + connectionPort() 
}

//
// Web3 API
//

var WEB3;
var INJECTED_WEB3 = false;
var LOCAL_WEB3    = false;
var USE_INJECTED  = true;

function connectionDefined() {
    return typeof WEB3 != "undefined";
}

function findConnections() {
    if (typeof web3 !== 'undefined') {
	// Use Mist/MetaMask's provider
	INJECTED_WEB3 = true;
	var tmpweb3 = new BundledWeb3(web3.currentProvider);
	var node = tmpweb3.version.getNode(function(err, result) {
	if (err) {
	    console.error(err)
	} else {
	    $('#connection-injection-text').html("Use " + result)	    
	}
	});
	$('#connection-injection-checkbox').prop('checked', true)
	$('.connection-injection').prop('hidden', false)
    }
    // Connect to a node.
    testWeb3 = new BundledWeb3(new Web3.providers.HttpProvider(connectionURL()));
    testWeb3.eth.getBlockNumber(function(error, result) {
	if (error) {
	    console.log(error);
	} else {
	    LOCAL_WEB3 = true;
	}
    });
}

function createConnection() {
    if (INJECTED_WEB3 && USE_INJECTED) {
	// Use Mist/MetaMask's provider
	INJECTED_WEB3 = true;
	WEB3 = new BundledWeb3(web3.currentProvider);
    } else {
	// Connect to a node.
	WEB3 = new BundledWeb3(new Web3.providers.HttpProvider(connectionURL()));
    }
    setNode();
    setProtocol();
    setBrowser();
    refreshAccounts();
}

function connectionAlive(yes, no) {
    if (connectionDefined()) {
	WEB3.eth.getBlockNumber(function(error, result) {
	    if (error) {
		console.log(error);
		no(error);
	    } else {
		yes();
	    }
	});
    } else { 
	no("No connection defined.");
    }
}

function checkConnectionStatus() {
    connectionAlive(
	function()        { setConnectionStatusConnected();           },
	function(message) {
	    if (!$('#connection-error-modal').is(':visible')) {
		setConnectionStatusDisconnected(message); }
	}
    );
}

function setNetwork() {
    var ethereumNetwork = $('#ethereum-network');
    WEB3.version.getNetwork(function(err, netId) {
	switch (netId) {
	case "1":
            ethereumNetwork.html("Mainnet");
	    break
	case "2":
            ethereumNetwork.html("Morden (deprecated)");
	    break
	case "3":
            ethereumNetwork.html("Ropsten");
	    break
	case "4":
            ethereumNetwork.html("Rinkeby");
	    break
	case "42":
            ethereumNetwork.html("Kovan");
	    break
	default:
            ethereumNetwork.html("Unknown");
	}
    });
}

//
// Status
//

function connectionRequired() {
    return $('#connection-status');
}

function setConnectionStatus(status, message) {
    $("#connection-status").html('<div class="alert alert-' + status + '" role="alert"><p class="card-text small">' + message  + '</p></div>');
}

function setConnectionStatusConnected() {
    $('.connection-loading').prop('hidden', true)
    $('.connection-error').prop('hidden', true)
    $('.connection-success').prop('hidden', false)
    setBrowser();
    setProtocol();
    setNode();    
}

function setConnectionStatusDisconnected(message) {
    $('.connection-error-text').html('Unable to connect to Ethereum Network[' + message + ']');
    $('.connection-loading').prop('hidden', true)
    $('.connection-error').prop('hidden', false)
    $('.connection-success').prop('hidden', true)
    setBrowser();
    setProtocol();
    setNode();
    $('#connection-error-modal').modal();
}    

function setBrowser() {
    $("#select-browser").val(browserFamily());
    setDebuggingInfoText();
}

function setNode() {
    WEB3.version.getNode(function(err, result) {
	if (err) {
	    console.error(err)
	} else {
            $('#ethereum-node').html(result);
            $("#select-node").val(nodeFamily(result));    
	    setNetwork();
            setDebuggingInfoText();    
	}
    });
    checkConnectionStatus();
}

function setProtocol() {
    $("#select-protocol").val(location.protocol);
    setDebuggingInfoText();
}

function setDebuggingInfoText() {
    var browser  = $('#select-browser').val();
    var node     = $('#select-node').val();
    var protocol = $('#select-protocol').val();
    var info = "";
    combinedConnectionInfo = browser+node+protocol
    switch (true) {
	// full matches
    case /ChromeMetamaskhttp\:/.test(combinedConnectionInfo):
        info = "Using the Metamask with Chrome and a locally hosted dApp at http:// has been tested and should be stable. Check that you have the metamask extention turned on."
        break;
    case /ChromeMetamaskhttps\:/.test(combinedConnectionInfo):
        info = "Using the Metamask with Chrome and a the remotely hosted dapp has been tested and should be stable. Check that you have the metamask extention turned on."
        break;
	// individaul warnings
    case /Mist.*/.test(combinedConnectionInfo):
	info = "Mist can connect with local nodes, but it is currently incompatible with Trezor Connect. In theory, you can use the external scripts to interact with your Trezor and enter the inputs manually, but this is untested.";
	break;
    case /IE.*/.test(combinedConnectionInfo):
	info = "This dApp has not been tested with Internet Explorer, use at your own risk.";
	break;
    case /^Parity.*/.test(combinedConnectionInfo):
	info = "Accessing this dApp through the Parity browser is untested.";
	break;	
	// Two value matching
    case /.*Parityfile\:/.test(combinedConnectionInfo):
        info = "To use parity while accessing the dApp with file://, you need to allow access to parity by include this flag: <code>--jsonrpc-cors null</code>";
        break;
    case /.*Parityhttp\:/.test(combinedConnectionInfo):
        info = "To use parity while accessing the dApp with a local webserver at http://, you need to allow access to parity by include this flag: <code>--jsonrpc-cors http://localhost:8435</code>";
        break;
    case /.*Gethfile\:/.test(combinedConnectionInfo):
        info = "To use geth while accessing the dApp with file://, you need to allow access to parity by include this flag: <code>--rpccorsdomain null</code>";
        break;
    case /.*Gethhttp\:/.test(combinedConnectionInfo):
        info = "To authorize geth to allow connections from a local webserver include this flag: <code>--rpccorsdomain http://localhost:8435</code>";
        break;
    case /.*Metamaskfile\:/.test(combinedConnectionInfo):
        info = "MetaMask is not compatible with file:// You will need to use a local webserver, access the remotely hosted dApp, or use a node such as parity or geth.";
        break;
	// Single Value matching
    case /.*Metamask.*/.test(combinedConnectionInfo):
        info = "Metamask is only compatible with Chrome, Firefox, Opera, and Brave."
        break;
    case /.*Other.*/.test(combinedConnectionInfo):
	info = "Select the ethereum node/wallet you are trying to use. If you are trying to use a node that is not listed, we have not tested it, use at your own risk.";
	break;
	// default	
    default :
	info = "This combination of browser, node, and protocol is untested, use at your own risk.";
	break;
    }
    $("#debugging-info-text").html(info);    
}

function enableBrowserInfo() {
    $('#select-browser').on('change',function(){
	setDebuggingInfoText();
    });
}

function enableProtocolInfo() {
    $('#select-protocol').on('change',function(){
	setDebuggingInfoText();
    });
}

function enableNodeInfo() {
    $('#select-node').on('change',function(){
	setDebuggingInfoText();
    });
}

function setConnectionStatusConnecting() {
    $('.connection-loading').prop('hidden', false)
    $('.connection-error').prop('hidden', true)
    $('.connection-success').prop('hidden', true)        
}

function periodicallyRefreshConnectionStatus() {
    console.info("Refreshing connection status...");
    checkConnectionStatus()
    if (/.*(create|spend).*/.test(location.pathname)) {
	setTimeout(periodicallyRefreshConnectionStatus, 10000)
    }
}

//
// Connect
//

function enableConnectButton() {
    $("#connection-form").submit(function(event) {
	event.preventDefault();
	USE_INJECTED = $("#connection-injection-checkbox").prop('checked')	
	createConnection();
    });
}


//
// Accounts & Balance
//

function setAccounts(accounts) {
    var select = $('#ethereum-account');
    if (accounts && accounts.length > 0) {
	var re = new RegExp(".*" + accounts[0] + ".*")
	if (!re.test(select.html())) {
	    select.html(
		$.map(accounts, function(account) {
		    return ('<option>'+ account + '</option>');
		}).join(''));
	}
	select.prop('disabled', false);
	setAccountBalance();
    } else {
	select.html('');
	setAccountBalance();
	select.prop('disabled', true);
    }
}

function refreshAccounts() {
    console.info("Refreshing accounts...");
    if (connectionDefined()) {
	WEB3.eth.getAccounts(function(error, result) {
	    if (error) {
		console.error(error);
	    } else {
		setAccounts(result);
	    }
	});
    }
}

function periodicallyRefreshAccounts() {
    refreshAccounts();
    setTimeout(periodicallyRefreshAccounts, 10000) 
}

function setAccountBalance() {
    var account   = $('#ethereum-account').val();
    var container = $('#ethereum-account-balance');
    if (account) {
	getAddressBalance(
	    account, 
	    function (balance) {
		container.html(formatFloat(balance, 8));
	    },
	    function(error) {
		container.html('0')
	    }
	);
    } else {
	container.html('0');
    }
}

function enableAccountBalanceLookup() {
    $('#ethereum-account').change(function(event) {
	setAccountBalance();
    });
}

//
// Transactions
//

function withValidAccount(callback, err) {
    connectionAlive(
	function() {
	    var account = $('#ethereum-account').val();
	    if (account && account.length > 0) {
		var balance = $('#ethereum-account-balance').text();
		if (balance && balance.length > 0 && parseFloat(balance) > 0) {
		    callback(account);
		} else {
		    err("Ethereum account must have a positive balance.");
		}
	    } else {
		err("An Ethereum account is required.");
	    }
	},
	function(message) { err(message); }
    );
}

$(function () {
    if (connectionRequired()) {
	findConnections();
	createConnection();
	enableBrowserInfo();
	enableProtocolInfo();
	enableNodeInfo();	
	enableConnectButton();
	periodicallyRefreshConnectionStatus();
	periodicallyRefreshAccounts();
	enableAccountBalanceLookup();
	enableShowConnectionDetails();
	enableHideConnectionDetails();
    }
});
