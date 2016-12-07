/**
 * throw/return error
 * 
 * @param  {string}            message
 * @param  {boolean=}          silent
 * @return {(undefined|Error)}
 */
function panic (message, silent) {
	// create an error object for stack tracing
	var error = new Error(message || '');

	// throw error/return error(silent)
	if (silent) { return error; } else { throw error; }
}

