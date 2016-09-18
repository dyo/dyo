# Contributing

## Build

There is no build step apart from running dio.js 
through uglify.js to produce dio.min.js,
though PR's without this are also ok.

## Suggestions

Create an issue to suggest it before sending a PR, 
you can also check ROADMAP.md to see if it's already in the ROADMAP
in which case you could send a PR for it.

## Running Tests

[See ./tests](https://github.com/thysultan/dio.js/tree/master/tests). 
100% test coverage is a work in progress. PR's for tests are welcome.

## Code Suggestions

* Use semicolons `;`
* Commas last `,`
* Tabs
* Prefer `'` over `"`

```javascript
// this...
function name () {

}

// ...not this
function name(){

}
// this makes it easier to search for
// name () to find where the function is
// declared and name() for where the function
// is used

// ...this
if (1 > 2) {
	return 2;
}
else {
	return 1;
}

// not this
if (1 > 2)
	return 2;
else
	return 1

// this...
var
doesSomthing,
doesAnotherThing;

// ...not this
var doesSomthing, doesAnotherThing;
```

Try to make function names, variable names and comments descriptive where possible.