/**
 * ---------------------------------------------------------------------------------
 * 
 * utilities
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * escape string
 * 
 * @param  {(string|boolean|number)} subject
 * @return {string}
 */
function escape (subject) {
	var string = subject + '';

	if (string.length > 50) {
		// use regex if the string is long
		return string.replace(escpattern, unicode);
	} else {
		var characters = '';

		for (var i = 0, length = string.length; i < length; i++) {
			switch (string.charCodeAt(i)) {
				// & character
				case 38: characters += '&amp;'; break;
				// " character
				case 34: characters += '&quot;'; break;
				// < character
				case 60: characters += '&lt;'; break;
				// > character
				case 62: characters += '&gt;'; break;
				// any character
				default: characters += string[i]; break;
			}
		}
		
		return characters;
	}
}


/**
 * unicode, escape => () helper
 * 
 * @param  {string} char
 * @return {string}
 */
function unicode (char) {
	return unicodes[char];
}


/**
 * input stream factory
 * 
 * used to build the css parser but could 
 * be used to develop other parsers as well
 * 
 * @param  {string} string
 * @return {Object}
 */
function input (string) {
 	// peek at the next character
 	function peek () { 
 		return string[position] || ''; 
 	}

 	// peek x number of characters relative to the current character
 	function look (distance) { 
 		return string[(position-1)+distance] || ''; 
 	}

 	// move on to the next character
 	function next () { 
 		return string[position++]; 
 	}

 	// get current position
 	function pos () {
 		return position;
 	}

 	// end of file
 	function eof () {
 		return position === length; 
 	}

 	// sleep until a certain character is reached
 	function sleep (until) {
 		// use character code for faster number-to-number comparison
 		var code = until.charCodeAt(0);

		while (position !== length && next().charCodeAt(0) !== code) {
			// empty
		} 
 	}

 	// position of the caret
 	var position = 0;
 	// length of string
 	var length = string.length;

 	return { 
 		next:  next, 
 		peek:  peek, 
 		eof:   eof, 
 		look:  look, 
 		sleep: sleep,
 		pos:   pos
 	};
}


/**
 * generate random string of a certain length
 * 
 * @param  {number} length
 * @return {string}
 */
function random (length) {
    var text     = '';
    var possible = 'JrIFgLKeEuQUPbhBnWZCTXDtRcxwSzaqijOvfpklYdAoMHmsVNGy';

    for (var i = 0; i < length; i++) {
        text += possible[Math.floor(Math.random() * 52)];
    }

    return text;
}


/**
 * throw/return error
 * 
 * @param  {string}            message
 * @param  {number=}           silent
 * @return {(undefined|Error)}
 */
function panic (message, silent) {
	// create an error object for stack stake tracing
	var error = (message || '').constructor === Error ? message : new Error(message);

	// throw error/return error(silent)
	if (silent) { 
		return error; 
	} else { 
		throw error; 
	}
}


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

/**
 * composes single-argument functions from right to left. The right most
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function
 *
 * @param  {...Function} funcs functions to compose
 * @return {function}          function obtained by composing the argument functions
 * from right to left. for example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
function compose () {
	var length = arguments.length;

	// no functions passed
	if (length === 0) {
		return function (a) { return a; }
	} else {
		// list of functions to compose
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


/**
 * flatten array
 *
 * @param  {any[]}  subject
 * @param  {any[]=} output
 * @return {any[]}  output
 */
function flatten (subject, output) {
	output = output || [];
	
	// for each item add to array, if an item is an array add recursively its elements
	for (var i = 0, length = subject.length; i < length; i++){
		var item = subject[i];

		// if it is not an array add its value to the output array
		if (item == null || item.constructor !== Array) {
			output[output.length] = item;
		} else {
			// recursively add the arrays elements to output
			flatten(item, output);
		}
	}
	
	return output;
}


/**
 * [].splice
 * 
 * @param  {any[]}   subject
 * @param  {number}  index
 * @param  {number}  deleteCount
 * @param  {Object=} itemToAdd
 */
function splice (subject, index, deleteCount, item) {
	if (item === void 0) {
		// remove first item with shift if start of array
		if (index === 0) { 
			return subject.shift(); 
		}
		// remove last item using pop if end of array
		else if (index > subject.length - 1) { 
			return subject.pop(); 
		}
		// remove at a specific index
		else { 
			return subject.splice(index, 1); 
		}
	} else {
		// prepend with unshift if start of array
		if (index === 0) { 
			return subject.unshift(item); 
		}
		// append using with push if end of array
		else if (index > subject.length - 1) { 
			return subject[subject.length] = item; 
		}
		// insert at a specific index
		else { 
			return subject.splice(index, deleteCount, item); 
		}
	}
}


/**
 * for in proxy
 * 
 * @param  {Object}   subject
 * @param  {Function} callback
 * @param  {*}        thisArg
 */
function each (subject, callback, thisArg) {
	for (var name in subject) {
		// if return false, exit
		if (callback.call(thisArg, subject[name], name, subject) === false) { 
			return;
		}
	}
}


/**
 * @param  {*} subject
 * @return {boolean}
 */
function isFunction (subject) {
	return typeof subject === 'function';
}


/**
 * @param  {*} subject
 * @return {boolean}
 */
function isString (subject) {
	return typeof subject === 'string';
}


/**
 * @param  {*} subject
 * @return {boolean}
 */
function isNumber (subject) {
	return typeof subject === 'number';
}


/**
 * @param  {*} subject
 * @return {boolean}
 */
function isArray (subject) {
	return subject != null && subject.constructor === Array;
}


/**
 * @param  {*} subject
 * @return {boolean}
 */
function isObject (subject) {
	return subject != null && subject.constructor === Object;
}


/**
 * @param  {*} subject
 * @return {boolean}
 */
function isDefined (subject) {
	return subject != null;
}


/**
 * @param  {*} subject 
 * @return {boolean}
 */
function isArrayLike (subject) {
	return subject != null && typeof subject.length === 'number' && typeof subject !== 'function';
}

