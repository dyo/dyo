/**
 * create stream
 * 
 * @param  {(function(resolve, reject)|*)} value
 * @param  {(function(...*)|boolean)}      middleware
 * @return {function}
 */
function stream (value, middleware) {
	var store;

	// this allows us to return values in a .then block that will
	// get passed to the next .then block
	var chain = { then: null, catch: null };

	// .then/.catch listeners
	var listeners = { then: [], catch: [] };

	// predetermine if a middlware was passed
	var hasMiddleware = middleware != null;

	// predetermine if the middlware passed is a function
	var middlewareFunc = hasMiddleware && typeof middleware === 'function';

	function Stream (value) {
		// received value, update stream
		if (arguments.length !== 0) {
			return (setTimeout(dispatch, 0, 'then', store = value), Stream);
		} else {
			// if you pass a middleware function i.e a = stream(1, String)
			// the stream will return 1 processed through String
			// if you pass a boolean primitive the assumtion is made that the store
			// is a function and that it should return the functions return value
			if (hasMiddleware) {
				return middlewareFunc ? middleware(store) : store();
			} else {
				return store;
			}
		}
	}

	// dispatcher, dispatches listerners
	function dispatch (type, value) {
		var collection = listeners[type];
		var length = collection.length;

		if (length !== 0) {
			// executes a listener, adding the return value to the chain
			var action = function (listener) {
				// link in the .then / .catch chain
				var link = listener(chain[type] || value);
				// add to chain if defined
				if (link !== void 0) { chain[type] = link; }
			}

			for (var i = 0; i < length; i++) {
				sandbox(action, reject, collection[i]);
			}
		}
	}

	// resolve value
	function resolve (value) {
		return Stream(value); 
	}

	// reject
	function reject (reason) { 
		setTimeout(dispatch, 0, 'catch', reason);
	}

	// add done listener, ends the chain
	function done (listener, onerror) {
		then(listener, onerror || true);
	}
	
	// add catch/error listener
	function error (listener) {
		return push('catch', listener, null);
	}

	// ...JSON.strinfigy()
	function toJSON () {
		return store;
	}

	// {function}.valueOf()
	function valueOf () {
		return store; 
	}

	// push listener
	function push (type, listener, end) {
		listeners[type].push(function (chain) {
			return listener(chain);
		});

		return end === null ? Stream : void 0;
	}

	// add then listener
	function then (listener, onerror) {
		if (onerror) {
			error(onerror);
		}

		if (listener) {
			return push('then', listener, onerror || null);
		}
	}

	// create a map
	function map (callback) {
		return stream(function (resolve) {
			resolve(function () { return callback(Stream()); });
		}, true);
	}

	// end/reset a stream
	function end (value) {
		value !== void 0 && (store = value);

		chain.then      = null;
		chain.catch     = null; 
		listeners.then  = []; 
		listeners.catch = [];
	}

	// assign public methods
	Stream.then    = then;
	Stream.done    = done;
	Stream.catch   = error;
	Stream.map     = map;
	Stream.end     = end;
	Stream.valueOf = valueOf;
	Stream.toJSON  = toJSON;
	// signature
	Stream._stream = true;

	// acts like a promise if a function is passed as value
	typeof value === 'function' ? value(resolve, reject) : Stream(value);

	return Stream;
}

