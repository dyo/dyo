/**
 * try catch helper
 * 
 * @param  {function}  func
 * @param  {function=} onError
 * @param  {any=}      value
 * @return {any}
 */
function sandbox (func, onError, value) {
	try {
		return value != null ? func(value) : func();
	} catch (err) {
		return onerror && onerror(err);
	}
}

