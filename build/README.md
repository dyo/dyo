# Build

```
npm run build
```

Will bundle everything in ./src into dio.js and watch for changes in the ./src that will update dio.js

## How it works

`build.js` parses the entry file index.js for any `import 'file'` or `require('file')` statements,
resolves the file and imports it once for the build.

This will also keeps a store of the imported files to avoid duplicate imports so that if i did the following

```javascript
// filename1.js
import 'render.js'

// filename2.js
import 'render.js';

// entry.js
import 'filename1.js';
import 'filename2.js';
```

render will get imported once the first time it is imported in `filename1.js`

## Exports

using `export default` or `export` with `import 'file.js' as variable` converts the exports to returns
and wraps the imported file in an IIFE `(function () { /* file.js */ }())` thus replacing
`import 'file.js' as variable` with `var variable = (function () { /* file.js */ }());`
multiple exports in `file.js` for example 

```javascript
export function add () {}
export function reverse () {}
export {upperCase, loweCase}; 
export single;
```

will yield

```javascript
var variable = (function () {
	return {
		add: add,
		reverse: reverse,
		upperCase: upperCase,
		lowerCase: lowerCase,
		single: single
	}
}());
```

the second statement in `import file.js as variable` and `imports file.js as another`
will create an alias to the import fo the first.

`export` statements in files will not output if the file is not imported with `... as variable`

for example the above export code will output

```javascript
function add () {}
function reverse () {}
```

which allows us to setup multiple builds that use the same file in different ways.

