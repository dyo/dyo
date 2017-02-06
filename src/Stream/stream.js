/**
 * create stream
 *
 * @public
 * 
 * @param  {(function(resolve, reject)|any)} value
 * @param  {(function(...any)|boolean)}      middleware
 * @return {function}
 */
function stream (value, middleware) {
	var store;

	// state
	var paused = false;

	// this allows us to return values in a .then block that will
	// get passed to the next .then block
	var chain = {then: null, catch: null};

	// .then/.catch listeners
	var listeners = {then: [], catch: []};

	// predetermine if a middlware was passed
	var plugin = middleware != null;

	// predetermine if the middlware passed is a function
	var func = plugin && typeof middleware === 'function';

	function observable (value) {
		// received value, update stream
		if (arguments.length !== 0) {
			store = value;
			
			schedule(function () {
				dispatch('then', store);
			});

			return observable;
		}
		else {
			// if you pass a middleware function i.e a = stream(1, String)
			// the stream will return 1 processed through String
			// if you pass a boolean primitive the assumtion is made that the store
			// is a function and that it should return the functions return value
			if (plugin) {
				return func ? middleware(store) : store();
			}
			else {
				return store;
			}
		}
	}

	// dispatcher, dispatches listerners
	function dispatch (type, value) {
		if (paused) {
			return;
		}

		var collection = listeners[type];
		var length = collection.length;

		if (length !== 0) {
			// executes a listener, adding the return value to the chain
			var action = function (listener) {
				// link in the .then / .catch chain
				var link = listener(chain[type] || value);
				
				// add to chain if defined
				if (link !== void 0) { 
					chain[type] = link; 
				}
			}

			for (var i = 0; i < length; i++) {
				sandbox(action, reject, collection[i]);
			}
		}
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

		return end === null ? observable : void 0;
	}

	// resolve value
	function resolve (value) {
		return observable(value); 
	}

	// reject
	function reject (reason) {
		schedule(function () {
			dispatch('catch', reason);
		});
	}

	// add done listener, ends the chain
	function done (listener, onerror) {
		then(listener, onerror || true);
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
			resolve(function () { return callback(observable()); });
		}, true);
	}

	// end/reset a stream
	function end (value) {
		if (value !== void 0) {
			store = value;
		}

		paused = false;
		chain.then = null;
		chain.catch = null; 
		listeners.then = []; 
		listeners.catch = [];
	}

	// pause stream
	function pause () {
		paused = true;
	}

	// resume stream
	function resume () {
		paused = false;
	}

	// assign public methods
	observable.then = then;
	observable.done = done;
	observable.catch = error;
	observable.map = map;
	observable.end = end;
	observable.valueOf = valueOf;
	observable.toJSON = toJSON;
	observable.resolve = resolve;
	observable.reject = reject;
	observable.pause = pause;
	observable.resume = resume;

	// acts like a promise if a function is passed as value
	if (typeof value === 'function') {
		value(resolve, reject);
	} 
	else {
		observable(value);
	}

	return observable;
}

