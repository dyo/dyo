# Build

```
npm run build
```

Will bundle everything in `./src` and `./packages/` into their respectful bundles and watch for changes in these directories updating the bundle when something changes.

## How it works

`build.js` parses the entry file `index.js` for any ES6 `import 'file'` statements,
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

using `export default` or `export` with `import 'file.js' as variable` wraps the imported file in an IIFE 
`(function () { /* file.js */ }())` that retuns the exports thus replacing
`import 'file.js' as variable` with `var variable = (function () { /* file.js */ return {...exports}; }());`

for example

```javascript
// file1.js
export function add () {}
export function reverse () {}
export {upperCase, loweCase}; 
export single;

// file2.js
import file1.js as variable;
```

will yield the following

```javascript
var variable = (function () {
	// ...file1.js content

	return {
		add: add,
		reverse: reverse,
		upperCase: upperCase,
		lowerCase: lowerCase,
		single: single
	}
}());
```

if there are two `import file.js as variable` and `imports file.js as another`
that both import that same file as a different variable then any imports
following the first import of that file will create an alias to the first import.

it should also be noted that `export` statements in files will not output 
if the file is not imported with `... as variable`

for example the `file1.js` code above will output

```javascript
function add () {}
function reverse () {}
```

which allows us to setup multiple builds that use the same file in different ways.

## Caveats

compile time errors are currently relative to the output bundle, this can get better, optimally they
would refer to the source module.