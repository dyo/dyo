/**
 * defers the execution of a function with predefined arguments
 * with an optional command to preventDefault event behaviour and
 * delay execution
 * 
 * @param  {function}  func
 * @param  {any[]-}    defaultArgs
 * @param  {boolean=}  preventDefault
 * @param  {number=}   duration
 * @return {function}
 */
function defer (func, defaultArgs, preventDefault, duration) {
	var empty = !defaultArgs || defaultArgs.length === 0;

	// return a function that calls `func` with args as arguments
	return function callback (e) {
		// auto prevent default
		if (preventDefault && e && e.preventDefault) {
			e.preventDefault();
		}

		// defaults to arguments if there are no predefined defaultArgs
		var args = empty ? arguments : defaultArgs;

		if (duration === void 0) {
			return func.apply(this, args);
		} else {
			setTimeout(call, duration, func, this, args);
		}
	}
}

