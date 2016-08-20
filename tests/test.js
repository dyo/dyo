(function (root, factory) {
	'use strict';

	// amd
    if (typeof define === 'function' && define.amd) {
        // register as an anonymous module
        define([], factory);
    }
    // commonjs
    else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        factory(exports, root);
    } 
    // browser globals
    else {
        factory(root, root);
    }
}(this, function (exports, root) {
	'use strict';

	var tests      = [];
	var testsCount = 0;
	var failures   = [];
	var assertions = 0;

	var filename = 'test.js';
	var div;

	// NODE_ENV
	var reset = '';
	var format = {
		reset: '\x1b[0m',
		green: '\x1b[32m',
		red: '\x1b[31m',
		yellow: '\x1b[33m',
		underline: '\x1b[4m',
		dim: '\x1b[2m',
		bold: '\x1b[1m',
		clear: '\x1Bc\n'
	}

	var 
	styles = {
		base: 'font-weight:bold;',
		failed: function () { return this.base+'color:red;'},
		passed: function () { return this.base+'color:green;'}
	};
	var stylesId = '%c%s';

	// BROWSER_ENV
	if (typeof document === 'object' && document.nodeType === 9) {
		div = document.createElement('div');
		div.style.fontSize   = '16px';
		div.style.fontFamily = 'sans-serif';
		div.style.margin     ='0 auto';

		setTimeout(function () {
			document.body.appendChild(div);
		});
	}

	function each (arr, fn) {
		var 
		index;

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

	function logger (name, results, onlyDom) {
		// count number of failed resutls
		var failedResults = results.filter(function(value){
			return value[0].toLowerCase().indexOf('fail') > -1
		});

		var failedResultsFraction = (results.length-failedResults.length) + '/' + results.length;
		var groupDiv;

		if (failedResults.length) {
			failures.push({
				results: failedResults, 
				failed: failedResultsFraction, 
				name: name
			});
		}
		

		// BROWSER_ENV
		if (div) {
			// open group
			console[failedResults.length ? 'group' : 'groupCollapsed'](name + ' (' + failedResultsFraction + ' passed)');

			groupDiv = document.createElement('div');
			groupDiv.insertAdjacentHTML('afterbegin', '<h1>' + name + 
				' <small>('+failedResultsFraction+' passed)</small></h1>');
		}

		var resultsLength = results.length;

		// iterate through results
		each(results, function (value) {
			var
			status  = value[0],
			message = value[1],
			// it is a failed test if we can find fail in the status
			failed  = status.toLowerCase().indexOf('fail') > -1,
			// get the corresponding style
			style   = failed ? styles.failed() : styles.passed(),
			status  = (failed ? '✘' : '✔') + ' ' + status;

			// BROWSER_ENV
			if (groupDiv) {
				groupDiv.insertAdjacentHTML(
					'beforeend',
					'<p style="line-height:180%;border-bottom:1px dashed #CCC;padding-bottom:8px;' + 
					style + 
					'">' + 
					status + 
					' ' + 
					message + 
					'</p>'
				);
			}

			if (failed) {
				status = new Error(status + ' `' + message + '`');

				if (status.stack === undefined) {
					try {
						throw status;
					} 
					catch (e) {
						status = e;
					}
				}

				var stack = [];

				each(status.stack.split('\n'), function (value) {
					if (!div) {
						if (value.indexOf('✘ failed') > -1) {
							value = format.bold + value + format.reset + format.red;
						}

						if (value.indexOf('at Object.<anonymous>') > -1) {
							value = format.dim + value + format.reset;
						}
					}

					if (
						value.indexOf(filename) === -1 &&
						value.indexOf('at Module._compile') === -1
					) {
						stack.push(value);
					}
				});

				stack = stack.join('\n');
				status = stack;
				status = status.replace('Error: ', '');
				message = '';
			}

			// NODE_ENV
			if (!div) {
				stylesId = '';
				
				if (failed) {
					style = format.red
				}
				else {
					style = format.green;
				}
			}

			// if failed console.error else .log
			console[failed ? 'error' : 'log'](stylesId, style, status, message, reset);
		});

		// BROWSER_ENV
		if (div) {
			div.appendChild(groupDiv);
			// end group
			console.groupEnd();
		}
	}

	function test (name, fn) {
		testsCount++;

		function tester () {
			// a store of test resutls
			var
			results = [],
			// passed and failed refernece string values
			passed = 'passed',
			failed = 'failed';

			// handles ok assertions
			// ok assertions send this handler
			// a status: {String} 'passed'|'failed'
			// and the corresponding message: {String}
			function handler (status, message) {
			    results.push([status, message]);
			}

			// assertions
			function ok (condition, message) {
				// evaluate condition to a boolean value
				condition = !!condition;

				// passed if condition is truefy
				// otherwise failed
				if (condition) {
					handler(passed, message);
				} else {
					handler(failed, message);
				}

				assertions += results.length;
			}

			// deep-equal function
			function eq (a, b) {
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
					if (!eq(a[i], b[i])) {
						return false;
					}
				}

				return true;
			}

			// simple spy (function collecting its calls)
			function spy (fn) {
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
					if (fn) {
						try {
							result = fn.apply(fn.this, arguments);
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

			// execute logger at the end of all tests
			function end () {
				if (div) {
					logger(name, results, true);
				}
				else {
					tests.push({name: name, results: results});
				}
			}

			// execute test enviroment
			fn(ok, eq, spy, end);
		}

		// execute tester
		tester();
	}

	function start () {


		if (!tests.length) {
			return;
		}

		// NODE_ENV
		if (!console.clear) {
			reset = format.reset;
			console.clear = function () {
		  		return console.log(format.clear+'    '+format.underline+'Test Results\n'+reset);
			}
		}

		console.clear();

		var start = new Date().getTime();

		each(tests, function (value) {
			logger(value.name, value.results);
		});
		
		var end = new Date().getTime();
		console.log((!div ? '\n    ' : '') + assertions + ' assertions completed in: ' + Math.round(end - start) + 'ms\n');

		if (!div && failures.length) {
			process.exit(1);
		}
	}

	test.start = start;
	exports.test = test;
}));