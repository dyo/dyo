/**
 * defer function
 *
 * defers the execution of a function with predefined arguments
 * and an optional command to preventDefault event behaviour
 * 
 * @param  {function} subject
 * @param  {any[]}    args
 * @param  {boolean}  preventDefault
 * @return {function}
 */
function defer (subject, args, preventDefault) {
	var empty = !args || args.length === 0;

	// return a function that calls `subject` with args as arguments
	return function callback (e) {
		// auto prevent default
		if (preventDefault && e && e.preventDefault) {
			e.preventDefault();
		}

		// defaults to arguments if there are no predefined args
		return subject.apply(this, (empty ? arguments : args));
	}
}

