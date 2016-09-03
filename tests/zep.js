/*!
 * ____  ____  ___  
 *  / / | |_  | |_) 
 * /_/_ |_|__ |_|  
 * 
 * zep.js - a javascript server and browser testing library
 * @author Sultan Tarimo <https://github.com/thysultan>
 * @license MIT
 */
(function (root, factory) {
	'use strict';

	// amd
    if (typeof define === 'function' && define.amd) {
        // register as an anonymous module
        define([], factory);
    }
    // commonjs
    else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        factory(exports);
    } 
    // browser globals
    else {
        factory(root);
    }
}(this, function (exports) {
	'use strict';

	var 
	element,
	root       = isNodeEnv() ? global : window,
	filename   = 'zep.js',
	passed     = '✔ passed',
	failed     = '✘ failed',
	tests      = [],
	failures   = 0,
	assertions = 0,
	startTime  = 0,
	pending    = 0,
	tab        = function () {
		return isNodeEnv() ? ' ' : '\t';
	},
	style      = {
		node: {
			reset:     '\x1b[0m',
			green:     '\x1b[32m',
			red:       '\x1b[31m',
			yellow:    '\x1b[33m',
			underline: '\x1b[4m',
			dim:       '\x1b[2m',
			bold:      '\x1b[1m',
			clear:     '\x1Bc\n'
		},
		id:     function () {
			return isNodeEnv() ? '' : '%c%s';
		},
		bold:   function () {
			return isNodeEnv() ? this.node.bold : 'font-weight:bold;';
		},
		failed: function () {
			return this.bold() + (isNodeEnv() ? this.node.red : 'color:red;')
		},
		passed: function () { 
			return this.bold() + (isNodeEnv() ? this.node.green : 'color:green;')
		}
	};

	function forEach (arr, fn) {
		// index {Number}
		var 
		index;

		// Handle arrays
		if (arr.constructor === Array) {
			// length {Number}
			var 
			length = arr.length;
			index  = 0;

			for (; index < length; ++index) {
				// break if fn() returns false
				if (fn(arr[index], index, arr) === false) {
					return;
				}
			}
		}
		// Handle objects 
		else {
			for (index in arr) {
				// break if fn() returns false
				if (fn(arr[index], index, arr) === false) {
					return;
				}
			}
		}
	}

	function request (url, callback) {
		if (typeof XMLHttpRequest !== 'function') {
			return;
		}
		var
		xhr = new XMLHttpRequest(),
		location = window.location,
		method = 'GET',
		a = document.createElement('a');
		
		a.href   = url;

		var
		CORS = !(
			a.hostname        === location.hostname &&
			a.port            === location.port     &&
			a.protocol        === location.protocol &&
			location.protocol !== 'file:'
		);

		a = undefined;
		
		xhr.open(method, url);
		
		xhr.onload = callback;
		xhr.onerror = function (err) {
			console.error(err);
		};

		xhr.send();
	}

	// get window keys and return the state of the current window
	// we use this to diff the window after all dependecies have loaded
	// to see what where the dependencies add to the window
	function keys (obj, retArr) {
	    var 
	    keys = [];

	    if (!retArr) {
	    	var map = {};
	    }
	    
	    for (var key in obj) {
	        if (!obj.hasOwnProperty(key)) {
	            continue;
	        }
	        
	        if (key.toLowerCase().indexOf('webkit') === -1 && key.toLowerCase().indexOf('moz') === -1) {
	        	keys.push(key);
	        	
	        	if (!retArr) {
	        		map[key] = obj[key];
	        	}
	        }
	    }

	    if (retArr) {
	    	return keys;
	    }

	    return {
	    	map: map,
	    	keys: keys
	    };
	}

	function isBrowserEnv () {
		return typeof document === 'object' && typeof window === 'object';
	}

	function isNodeEnv () {
		return (
					typeof require === 'function' && 
			   		typeof module  === 'object' &&
			   		typeof module.exports !== 'undefined'
			   )
	}

	function getWindowDependencyAdded (windowKeysBefore, windowKeysAfter, window) {
		if (windowKeysBefore.keys.length !== windowKeysAfter.keys.length) {
			var 
			dependencyMap = {};

			forEach(windowKeysAfter.keys, function (name) {
				var propertyBefore = windowKeysBefore.map[name];

				if (propertyBefore === undefined) {
					var propertyAfter = windowKeysAfter.map[name];
					dependencyMap[name] = propertyAfter;
				}
			});

			return dependencyMap;
		}
	}

	function utilities () {
		return {
			spy: spy,
			describe: describe
		}
	}

	// deep-equal function
	function isDeepEqual (a, b) {
		if (typeof a !== typeof b) {
			return false;
		}
		if (a instanceof Function) {
			return a.toString() === b.toString();
		}
		if (a === b || a.valueOf() === b.valueOf()) {
			return true;
		}
		if (!(a instanceof Object)) {
			return false;
		}

		var aKeys = Object.keys(a);
		if (aKeys.length != Object.keys(b).length) {
			return false;
		}
		
		for (var i in b) {
			if (!b.hasOwnProperty(i)) {
				continue;
			}
			if (aKeys.indexOf(i) === -1) {
				return false;
			}
			if (!isDeepEqual(a[i], b[i])) {
				return false;
			}
		}

		return true;
	}

	// simple spy (function collecting its calls)
	function spy (block) {
		function spyer () {
			var 
			result;

			// when this function is called
			// we will set that it was called
			spyer.called = spyer.called || [];
			spyer.thrown = spyer.thrown || [];

			// a function was passed
			// execute and see if it throws anything
			// catch that and add it to the .throw array
			// if not we add undefined to thrown
			// signaling that the function we passed
			// did infact get called though
			// it did not throw an exception
			if (block) {
				try {
					result = block.apply(block.this, arguments);
					spyer.thrown.push(undefined);
				} catch (e) {
					spyer.thrown.push(e);
				}
			}

			// set that this function was called
			// added to the .called array
			spyer.called.push(arguments);
			return result;
		}

		return spyer;
	}

	function assertFactory (test) {
		function doesThrow (block, error) {
			var 
			result;

			try {
				block();
			}
			catch (e) {
				// value check
				if (typeof error === 'string') {
					result = e === error;
				}
				else if (typeof error === 'function') {
					// type check
					if (root[error.name]) {
						result = e.constructor === error;
					}
					// validator
					else {
						result = error(e);
					}
				}
				// regex check
				else if (error && error.constructor === RegExp) {
					var 
					matches = e.match(error);
					result  = !!matches && !!matches.length
				}
			}

			return result;
		}

		function equal (actual, expected, message) {
			return assert(actual === expected, message);
		}

		function notEqual (actual, expected, message) {
			return assert(actual !== expected, message);
		}

		function deepEqual (actual, expected, message, _) {
			if (typeof message === 'boolean') {
				var condition = message;
				message = _;

				if (!condition) {
					return assert.fail('','', message);
				}
			}

			return assert(isDeepEqual(actual, expected), message);
		}

		function notDeepEqual (actual, expected, message) {
			return assert(!isDeepEqual(actual, expected), message);
		}

		function throws (block, error, message) {
			return assert(throws(block, error), message);
		}

		function doesNotThrow (block, error, message) {
			return assert(throws(block, error), message);
		}

		function fail (actual, expected, message, operator) {
			return assert(false, message ? message : '' + actual + operator + expected);
		}

		function ifError (value) {
			return value ? assert(!value, '' + value) : undefined;
		}

		// assertions
		function assert (condition, message) {
			var 
			handler = assertion;

			// evaluate condition to a boolean value
			condition = !!condition;

			// passed if condition is truefy
			// otherwise failed
			if (condition) {
				handler(passed, message, test);
			} else {
				handler(failed, message, test);
			}

			return condition;
		}

		assert.ok = assert;
		assert.equal = equal;
		assert.notEqual = notEqual;
		assert.deepEqual = deepEqual;
		assert.notDeepEqual = notDeepEqual;
		assert.throws = throws;
		assert.doesNotThrow = doesNotThrow;
		assert.fail = fail;
		assert.ifError = ifError;

		return assert;
	}

	function zep () {
		var
		workspace,
		dependencies = [],
		args = arguments,
		loadedDependenciesCount = 0;

		function doneLoadingDependencies () {
			return loadedDependenciesCount === dependencies.length;
		}

		if (args.length > 1) {
			workspace = args[1];
			dependencies = args[0];
		}
		else {
			workspace = args[0];
		}

		if (dependencies.length && workspace) {
			if (isBrowserEnv()) {
				var 
				windowKeys = keys(window);
			}
			else {
				var
				dependencyStore = [];
			}

			forEach(dependencies, function (url) {
				// browser
				if (isBrowserEnv()) {
					// make http request for dependency
					request(url, function () {
						var
						script = document.createElement('script');

						document.head.appendChild(script);

						script.onload = function () {
							loadedDependenciesCount++;

							if (doneLoadingDependencies()) {
								console.clear();
								initialize(function () {
									workspace.call(context(), utilities(), getWindowDependencyAdded(windowKeys, keys(window), window));
								});
							}
						}
						script.src = this.responseURL;
					});
				}
				// node
				else if (isNodeEnv()) {
					loadedDependenciesCount++;

					var 
					dependency = require(url);
					dependencyStore.push(dependency);

					if (doneLoadingDependencies()) {
						var 
						dependencyStoreExported = {};

						forEach(dependencyStore, function (value, index) {
							for (var key in value) {
								dependencyStoreExported[key] = value[key];
							}
						});

						initialize(function () {
							workspace.call(context(), utilities(), dependencyStoreExported);
						});
					}
				}
			});
		}
		else {
			workspace(utilities());
		}
	}

	// describe test
	function describe (name, workspace) {
		pending++;

		tests.push({
			name: name,
			workspace: workspace,
			assertions: []
		});
	}

	// initialize and log
	function initialize (workstation) {
		var 
		results = {};

		workstation();

		if (isNodeEnv()) {
			console.log(style.node.bold + 'Tests' + style.node.reset);
		}

		startTime = new Date().getTime();

		forEach(tests, function (test, index) {
			var 
			workspace = test.workspace,
			assert    = assertFactory(test);

			if (workspace.length > 1) {
				workspace(assert, function done () {
					pending--;
					capture(test, index);
				});
			}
			else {
				pending--;
				workspace(assert);
				capture(test, index);
			}
		});
	}

	function context (ctx) {
		return ctx || null;
	}

	function doesNotContain (value, arr) {
		return arr.filter(function (string) {
			if (typeof value === 'string' && value.indexOf(string) > -1) {
				return true;
			}
		}).length === 0;
	}

	function assertion (status, message, test) {
		test.assertions.push({
			status: status,
			message: message
		});
	}

	function capture (test, index, tests) {
		var name        = test.name;
		var messages    = [];
		var failCount   = 0;
		var assertCount = 0;

		forEach(test.assertions, function (result) {
			messages.push([result.status, result.message]);

			if (result.status.indexOf(failed) > -1) {
				failCount++;
			}

			assertCount++;
		});

		failures   = failures + failCount;
		assertions = assertions + assertCount;

		logger(name, messages, failCount, assertCount);

		if (pending === 0) {
			var message = (
				assertions + ' assertions with ' + 
				failures + ' failed, ' +
				'completed in ' + Math.round(new Date().getTime() - startTime) + 'ms'
			);

			if (isNodeEnv()) {
				console.log(
					(isNodeEnv() ? style.node.bold : '') + 
					message,
					(isNodeEnv() ? style.node.reset : '')
				);

				if (failures > 0) {
					// this makes npm test report a failed test
					process.exit(1);
				}
			}
			else if (isBrowserEnv()) {
				document.head.querySelector('title').textContent = (
					failures + ' test' + (failures > 1 ? 's' : '') + ' failed'
				);
			}
		}
	}

	function log (type, name, style, status, message, reset, didFail) {
		if (style) {
			console[type](
				name, 
				style, 
				status,
				message,
				reset
			);
		}
		else {
			console[type](name);
		}

		if (isBrowserEnv()) {
			setTimeout(function () {
				// p
				if (style) {
					var element = document.createElement('p');
					element.textContent = status + ' ' + message;
					element.setAttribute('style', 'font-family:sans-serif;font-weight:bold;line-height:180%;'+
						'border-bottom:1px dashed #CCC;padding-bottom: 8px;' +
						(didFail ? 'color:red;' : 'color:green;')
					)
					document.body.appendChild(element);
				}
				// h1
				else {
					var element = document.createElement('h1');
					element.textContent = name;
					element.setAttribute('style', 'font-family:sans-serif');
					document.body.appendChild(element);
				}
			});
		}
	}

	function logger (name, messages, failCount, assertCount) {
		name = name + ' (' + (assertCount-failCount) + '/' + assertCount + ' passed)';

		log('log', name);

		forEach(messages, function (message) {
			var 
			status = message[0],
			message = message[1],
			didFail = status.indexOf(failed) > -1;

			if (didFail && isNodeEnv()) {
				var error = new Error(message);

				if (error.stack === undefined) {
					try {
						throw error;
					} 
					catch (e) {
						error = e;
					}
				}

				var stack = error.stack.split('\n').filter(function (value) {
					if (
						doesNotContain(
							value, 
							[
								failed, 
								filename,
								'at Module._compile', 
								'Error: ', 
								'at tryOnTimeout', 
								'at Timer.listOnTimeout'
							]
						)
					) {
						return true;
					}
				});

				stack = stack.join('\n');
				message += '' + style.failed() + style.node.dim + stack + style.node.reset;
			}

			log(
				didFail ? isNodeEnv() ? 'log' : 'trace' : 'log',
				style.id(), 
				didFail ? style.failed() : style.passed(), 
				tab() + status,
				(isNodeEnv() ? style.node.reset : '') + message,
				(isNodeEnv() ? style.node.reset : ''),
				didFail
			);
		});
	}


	// determine the enviroment and export zep
	if (isNodeEnv()) {
		module.exports = zep;
	}
	else {
		exports.zep = zep;
	}
}));