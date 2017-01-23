/**
 * schedule callback
 * 
 * @type {function}
 * @param {function} callback
 */
var schedule;

if (requestAnimationFrameSupport) {
	schedule = function schedule (callback) { 
		requestAnimationFrame(callback);
	}
}
else if (setImmediateSupport) {
	schedule = function schedule (callback) { 
		setImmediate(callback); 
	}
}
else if (promiseSupport) {
	schedule = function schedule (callback) { 
		Promise.resolve().then(callback); 
	}
}
else {
	schedule = function schedule (callback) { 
		setTimeout(callback, 0); 
	}
}

