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
	var store; 
	var chain = {then: null, 'catch': null}; 
	var listeners = {then: [],'catch': []};

	function Stream (value) {
		// received value, update stream
		if (arguments.length !== 0) {
			dispatch('then', store = value);
			return Stream;
		}

		var output;

		// special store
		if (middleware) {
			// if middleware function
			output = typeof middleware === 'function' ? middleware(store) : store();
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
					function (e) {
						Stream.reject(e);
					}
				)
			}
		}
	}

	// ...JSON.strinfigy()
	Stream.toJSON = function () { 
		return store; 
	};

	// {function}.valueOf()
	Stream.valueOf = function () { 
		return store; 
	};

	// resolve value
	Stream.resolve = function (value) {
		return Stream(value); 
	};

	// reject
	Stream.reject = function (reason) { 
		dispatch('catch', reason); 
	};

	// push listener
	Stream.push = function (type, listener, end) {
		listeners[type].push(function (chain) {
			return listener(chain);
		});

		return end === undefined ? Stream : undefined;
	};

	// then listener
	Stream.then = function (listener, error) {
		if (error !== undefined) {
			Stream['catch'](error);
		}

		if (listener !== undefined) {
			return Stream.push('then', listener, error);
		}
	};

	// done listener, ends the chain
	Stream.done = function (listener, error) {
		Stream.then(listener, error || 1);
	};

	// catch listener
	Stream['catch'] = function (listener) {
		return Stream.push('catch', listener);
	};

	// create a map
	Stream.map = function (map) {
		return stream(function (resolve) {
			resolve(function () { return map(Stream()); });
		}, 1);
	};

	// end/reset a stream
	Stream.end = function () {
		chain.then         = null;
		chain['catch']     = null;
		listeners.then     = [];
		listeners['catch'] = [];
	};

	// id to distinguish functions from streams
	Stream._stream = true;

	typeof value === 'function' ? value(Stream.resolve, Stream.reject, Stream) : Stream(value);

	return Stream;
}


/**
 * combine two or more streams
 * 
 * @param  {function}  reducer
 * @return {streams[]} deps
 */
stream.combine = function combine (reducer, deps) {
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
	}, 1);
};


/**
 * do something after all dependecies have resolved
 * 
 * @param  {any[]} deps
 * @return {function}
 */
stream.all = function all (deps) {
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

			if (value._stream === 0) {
				value.done(function (value) {
					resolver(value, resolve);
				}, function (reason) {
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
stream.scan = function scan (reducer, accumulator, stream) {
	return Stream(function (resolve) {
		// attach a listener to stream, 
		stream.then(function () {
			// update the accumulator with the returned value of the reducer,
			accumulator = reducer(accumulator, stream);
			// resolve the store of the stream we return back
			resolve(accumulator);
		});
	});
}