/**
 * try catch helper
 * 
 * @param  {function}  func
 * @param  {function=} error
 * @param  {any=}      value
 * @return {any}
 */
function tryCatch (func, error, value) {
	try {
		return value != null ? func(value) : func();
	} catch (e) {
		return error && error(e);
	}
}

