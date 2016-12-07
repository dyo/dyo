/**
 * try catch helper
 * 
 * @param  {function}  func
 * @param  {function=} onerror
 * @param  {any=}      value
 * @return {any}
 */
function sandbox (func, onerror, value) {
	// hoisted due to V8 not opt'ing functions with try..catch
	try {
		return value ? func(value) : func();
	} catch (err) {
		return onerror && onerror(err);
	}
}

