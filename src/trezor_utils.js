var trezor = require("trezor.js");

function jsonize(obj) {
    // console.info(JSON.stringify);
    // return JSON.stringify(obj, null, 2);
    return obj
}

function bip32SequenceFromPath(path) {
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

function callTrezor(interaction) {
    device_list = new trezor.DeviceList({debug: true});

    return new Promise(function(resolve, reject) {
	device_list.on('error',                deviceListErrorCallback(reject));
	device_list.on('transport',            deviceListTransportCallback);
	device_list.on('button',               deviceListButtonCallback);	
	device_list.on('connectUnacquired',    deviceListConnectUnacquiredCallback);    
	device_list.on('connect',              deviceListConnectCallback(resolve, reject, interaction));
	device_list.on('disconnect',           deviceListDisconnectCallback);
	
	// you should do this to release devices on reload
	process.on('exit', function() {
	    device_list.onbeforeunload();
	});
    });
}

//
// DeviceList Callbacks
//

function deviceListErrorCallback(reject) {
    return function(error) {
        console.error("DeviceList", error);
	reject(error);
    };
}

function deviceListTransportCallback(transport) {
//    console.info('DeviceList', "transport acquired", transport);
}

function deviceListButtonCallback(transport) {
    console.info('DeviceList', "Button", transport);
}

function deviceListConnectUnacquiredCallback() {
    return (device) => {
        console.info('DeviceList', 'unacquired device connected', device);
	device.steal().then(() => {
            console.info("DeviceList", "stole", device); // then wait for another connect
        });
    }
}

function deviceListConnectCallback(resolve, reject, interaction) {
    return function(device, previousDevice) {
        // What to do on user interactions:
        // device.on('changedSessions', deviceChangedSessionsCallback);	
	device.on('error',      deviceErrorCallback(reject));
        device.on('button',     deviceButtonCallback);	
        device.on('passphrase', devicePassphraseCallback);
        device.on('pin',        devicePINCallback);
        device.on('disconnect', deviceDisconnectCallback(reject));
	device.on('send',       deviceSendCallback);
	device.on('receive',    deviceReceiveCallback);
 
        // You generally want to filter out devices connected in bootloader mode:
        if (device.isBootloader()) {
            reject('Device is in bootloader mode, re-connect it');
        }
	
        device.waitForSessionAndRun(function(session) {
            interaction(device, session, resolve, reject);
	});
    }
}

function deviceListDisconnectCallback(device) {
    console.info('DeviceList', 'device disconnected', device);
}

function deviceListDisconnectUnacquiredCallback(device) {
    console.info("DeviceList", "unacquired device disconnected", device);
}

//
// Device Callbacks
//

function deviceDisconnectCallback(reject) {
    return function() {
        console.info('Device', 'disconnected while opened');
	reject('disconnected while opened');
    };
}

function deviceErrorCallback(reject) {
    return function(error) {
        console.error("Device", error);
	reject(error);
    };
}

function deviceSendCallback(type, msg) {
    console.info("Device", "sent", type, msg);
}

function deviceReceiveCallback(type, msg) {
    console.info("Device", "received", type, msg);
}

function deviceButtonCallback(type) {
    console.log('Device', "button", type);
}

function devicePINCallback(type, callback) {
    console.log('Device', 'pin', type);
}

function devicePassphraseCallback(callback) {
    console.log('Device', 'passphrase', type);
}

module.exports = { bip32SequenceFromPath, callTrezor }
