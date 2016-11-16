/**
 * ---------------------------------------------------------------------------------
 * 
 * streams
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * create stream, getter/setter
 * 
 * @param  {*}        value
 * @param  {function} middleware
 * @return {function}
 */
function stream (value, middleware) {
	var chain = { then: null, catch: null }; 
	var listeners = { then: [], catch: [] };

	var store;

	var hasMiddleware = !!middleware;
	var middlewareFunc = hasMiddleware && typeof middleware === 'function';

	// constructor
	function Stream (value) {
		// received value, update stream
		if (arguments.length !== 0) {
			dispatch('then', store = value);
			return Stream;
		}

		var output;

		// special store
		if (hasMiddleware) {
			// if middleware function
			output = middlewareFunc ? middleware(store) : store();
		} else {
			output = store;
		}

		return output;  
	}

	// dispatcher, dispatches listerners
	function dispatch (type, value) {
		var collection = listeners[type]; 
		var length = collection.length;

		if (length !== 0) {
			for (var i = 0; i < length; i++) {
				var listener = collection[i];

				sandbox(
					function () {
						// link in the .then / .catch chain
						var link = listener(chain[type] || value);

						// add to chain if defined
						if (link !== undefined) {
							chain[type] = link;
						}
					}, 
					reject
				)
			}
		}
	}

	// resolve value
	function resolve (value) {
		return Stream(value); 
	}

	// reject
	function reject (reason) { 
		dispatch('catch', reason); 
	}

	// push listener
	function push (type, listener, end) {
		listeners[type].push(function (chain) {
			return listener(chain);
		});

		return !end ? Stream : undefined;
	};

	// add then listener
	function then (listener, onerror) {
		if (onerror) {
			error(onerror);
		}

		if (listener) {
			return push('then', listener, onerror);
		}
	}

	// add done listener, ends the chain
	function done (listener, onerror) {
		then(listener, onerror || true);
	}

	// create a map
	function map (dep) {
		return stream(function (resolve) {
			resolve(function () { return dep(Stream()); });
		}, true);
	}

	// end/reset a stream
	function end () {
		chain.then = null; 
		chain.catch = null;

		listeners.then = [];
		listeners.catch = [];
	}

	// add catch/error listener
	function error (listener) {
		return push('catch', listener);
	}

	// ...JSON.strinfigy()
	function toJSON () { 
		return store;
	}

	// {function}.valueOf()
	function valueOf () { 
		return store; 
	}

	// assign public methods
	Stream.then = then;
	Stream.done = done;
	Stream.catch = error;
	Stream.map = map;
	Stream.end = end;
	Stream.valueOf = valueOf;
	Stream.toJSON = toJSON;

	// id to distinguish functions from streams
	Stream._stream = true;

	// acts like a promise if function is passed as value
	typeof value === 'function' ? value(resolve, reject, Stream) : Stream(value);

	return Stream;
}


/**
 * combine two or more streams
 * 
 * @param  {function}  reducer
 * @return {streams[]} deps
 */
stream.combine = function (reducer, deps) {
	if (typeof deps !== 'object') {
		var args = [];

		for (var i = 0, length = arguments.length; i < length; i++) {
			args[i] = arguments[i];
		}

		deps = args;
	}

	// add address for the prev store
	deps[deps.length] = null;

	// the previous store will always be the last item in the list of dependencies
	var prevStoreAddress = deps.length - 1;

	// second arg === 1 allows us to pass a function as the streams store
	// that runs when retrieved
	return stream(function (resolve) {
		resolve(function () {
			// extract return value of reducer, assign prevStore, return it
			return deps[prevStoreAddress] = reducer.apply(null, deps);
		});
	}, true);
};


/**
 * do something after all dependecies have resolved
 * 
 * @param  {any[]} deps
 * @return {function}
 */
stream.all = function (deps) {
	var resolved = [];

	// pushes a value to the resolved array and compares if resolved length
	// is equal to deps this will tell us when all dependencies have resolved
	function resolver (value, resolve) {
		resolved[resolved.length] = value;

		if (resolved.length === deps.length) {
			resolve(resolved);
		}
	}

	return stream(function (resolve, reject) {
		// check all dependencies, if a dependecy is a stream attach a listener
		// reject / resolve as nessessary.
		for (var i = 0, length = deps.length; i < length; i++) {
			var value = deps[i];

			if (value._stream) {
				value.then(function (value) {
					resolver(value, resolve);
				}).catch(function (reason) {
					reject(reason);
				});
			} else {
				resolver(value, resolve);
			}
		}
	});
};


/**
 * creates a new stream that accumulates everytime it is called
 *
 * @example var bar = stream.scan((sum, n) => { sum + n }, 0, foo = {Stream}) 
 * foo(1)(1)(2) // bar => 4
 *
 * @param  {function} reducer
 * @param  {*}        accumulator
 * @param  {function} stream 
 * @return {function} stream
 */
stream.scan = function (reducer, accumulator, stream) {
	return Stream(function (resolve) {
		// attach a listener to stream, 
		stream.then(function () {
			// update the accumulator with the returned value of the reducer,
			accumulator = reducer(accumulator, stream);
			// resolve the store of the stream we return back
			resolve(accumulator);
		});
	});
};


/**
 * create new stream in resolved state
 * 
 * @param  {any} value
 * @return {Stream}
 */
stream.resolve = function (value) {
	return stream(function (resolve, reject) {
		setTimeout(resolve, 0, value);
	});
};


/**
 * create new stream in rejected state
 * 
 * @param  {any} value 
 * @return {Stream}
 */
stream.reject = function (value) {
	return stream(function (resolve, reject) {
		setTimeout(reject, 0, value);
	});
};

