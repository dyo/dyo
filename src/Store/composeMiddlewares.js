/**
 * composes single-argument functions from right to left. The right most
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function
 * 
 * @param  {...function} funcs functions to compose
 * @return {function}          function obtained by composing the argument functions
 * from right to left. for example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
function composeMiddlewares () {
	var length = arguments.length;

	// no functions passed
	if (length === 0) {
		return function (a) { 
			return a;
		}
	}
	else {
		// functions to compose
		var funcs = [];

		// passing arguments to a function i.e [].splice() will prevent this function
		// from getting optimized by the VM, so we manually build the array in-line
		for (var i = 0; i < length; i++) {
			funcs[i] = arguments[i];
		}

		// remove and retrieve last function
		// we will use this for the initial composition
		var lastFunc = funcs.pop();

		// decrement length of funcs array as a reflection of the above
		length--;

		return function () {
			// initial composition
			var output = lastFunc.apply(null, arguments);
				
			// recursively commpose all functions
			while (length--) {
				output = funcs[length](output);
			}

			return output;
		}
	}
}

