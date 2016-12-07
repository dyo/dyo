/**
 * log validation errors
 * 
 * @param {string} error 
 */
function logValidationError (error) {
	console.error('Warning: Failed propType: ' + error + '`.');
	// this error is thrown as a convenience to trace the call stack
	sandbox(function () { panic(error); });
}

