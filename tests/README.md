# Tests



## running tests

Open `index.html` in a browser, inspect the console for more details. Here is an example of how it should look: [https://rawgit.com/thysultan/dio.js/master/tests/index.html](https://rawgit.com/thysultan/dio.js/master/tests/index.html).

You can also run these tests in node with `npm test`.

## how to create a test

```javascript
describe('name of test', function(assert) {
	// spy functions will have a .called array of
	// parameters passed to it to indicate they where called
	var spyer = spy();
	
	// i.e call it twice with two set of different arguments
	spyer(1,2,3);
	spyer(0,4,5);
	
	spyer.called // => [arguments1, arguments2]
	
	// there is also a .throw param on a spyer
	// i.e spyer.thrown that is added when a spyer
	// is called, it is an empty array by default
	// but if you pass a function to spy(fn)
	// that throws an error
	// it will contain the error
	// if the function does not throw an error
	// it will have [undefined,...]

	// deep-equal
	assert.deepEqual([1,2,3], [1,2,3]) // => true
	
	// assertions
	assert(condition, 'message')
	// spy functions, for example
	assert(spy.called, '.method({Object})')

	// these are all the assert helpers
	// assert(value[, message])
	// assert.deepEqual(actual, expected[, message])
	// assert.doesNotThrow(block[, error][, message])
	// assert.equal(actual, expected[, message])
	// assert.fail(actual, expected, message, operator)
	// assert.ifError(value)
	// assert.notDeepEqual(actual, expected[, message])
	// assert.notEqual(actual, expected[, message])
	// assert.ok(value[, message])
	// assert.throws(block[, error][, message])
});

// async tests?
describe('test name', function (assert, done) {
	// add a second done argument for tests that will have
	// an async nature then execute done() when the test is done
	setTimeout(function(){
		assert(true, 'async test');
		end();
	}, 100);
});

// what about?
zep(['../dio.js'], function (utili, deps) {
	'use strict';

	var {dio, h} = deps;
	var {describe, spy} = utili;
});

// this tells zep
// 1. this test has dependencies, require them as neccessary
//    zep will either require('lib') in a node enviroment 
//    or http request it in a browser enviromennt
// 2. this is the workstation/container i will use to define my tests
//    zep passes utilities and the dependencies to it
//    which we extract with
//    
//    var {dio, h} = deps;
//    var {describe, spy} = utili;
```