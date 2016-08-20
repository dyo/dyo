# Tests



## running tests

Open `index.html` in a browser, inspect the console for more details.
The console should look like the below block of code that you can click into to check the details of each test, by default tests without failed assertions are collapsed. Here is an example of how it should look: [https://rawgit.com/thysultan/dio.js/master/tests/index.html](https://rawgit.com/thysultan/dio.js/master/tests/index.html).

You can also run these tests in node with `npm test`.

```javascript
// collapsed
>> dio.methodName(#passed/#total passed)

// opened
>> dio.methodName(#passed/#total passed)
        passed '{message}'
        passed '{message}'
```


## how to create a test

```javascript
test('name of test', function(ok, eq, spy, end) {
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
	eq([1,2,3], [1,2,3]) // => true
	
	// assertions
	ok(condition, 'message')
	// for example
	ok(spy.called, '.method({Object})')
	
	// calling end() indicates the end of this test
	end();
	
	// inspecting the console you will see something like
	// > name of test (2/2 passed)
	// click on it to see the details of the test
	// tests that have failed assertions will be open
	// by default.
	
	// async tests?
	setTimeout(function(){
		ok(true, 'async test');
		end();
	}, 100);

	// this will start to run all the defined tests
	test.start();
});
```