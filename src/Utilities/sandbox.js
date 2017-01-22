/**
 * try catch helper
 * 
 * @param  {function}  func
 * @param  {function=} errorHandler
 * @param  {any=}      arg
 * @return {any}
 */
function sandbox (func, errorHandler, arg) {
	try {
		return arg != null ? func(arg) : func();
	}
	catch (error) {
		return errorHandler != null && errorHandler(error);
	}
}

