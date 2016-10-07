# API Reference

## components schema

```javascript
{
	// lifecycle methods
	shouldComponentUpdate:     (newProps, newState) => {}
	componentWillReceiveProps: (newProps) => {}
	componentWillUpdate:       (newProps, newState) => {}
	componentDidUpdate:        (oldProps, oldState) => {}
	componentWillMount:        () => {}
	componentDidMount:         () => {}
	componentWillUnmount:      () => {}
	
	// this.methods
	this.withAttr              ({string|string[]}, {function|function[]})

	this.forceUpdate:          ()

	// setState is synchronous
	// setState also calls this.forceUpdate
	// setState will execute the callback before this.forceUpdate
	this.setState:             ({Object}, callback: {function=})
	this.setProps:             ({Object})

	// displayName is auto created when you create a component
	// with a function like dio.createClass({Function})
	// i.e function Foo () {} the displayName will be Foo
	// you can also set this manually {
	// 		displayName: 'something'
	// }
	// it is however an optional property so you do not need to set it,
	displayName:               {string}

	// adds validation for props
	propTypes:                 {Object}

	// adds static methods to the component, 
	// i.e var Parent = dio.createClass({statics: {meth1: ...}}) Parent.meth1();
	statics:                   {Object}

	// render method
	render:                    (props, state, this) => {}
}
```

---

## creating hyperscript objects

```javascript
h(
	tag: {String}, 
	props?|children?: {Object} | {Array|Object}...,
	children?: {Array|Object}...
)

h('.wrap')
// <div class=wrap></div>

h('input[type=checkbox]')
// <input type=checkbox>

h('input', {value: 'text', onInput: ()=>{}})
// <input value=text>

h('div', 'Text')
// <div>Text</div>

h('div', h('span', 'Text'))
// <div><span>Text</span></div>

h('div', [h('h1', '1st'), h('h1', '2nd'), ...])
// <div><h1>1st</h1><h1>2nd</h1></div>

h('div', {innerHTML: "<script>alert('hello')</script>"});
// <div><script>alert('hello')</script></div>

h(Component, {who: 'World'}, 1, 2, 3, 4)
// passes {who: ...} as props and 1, 2, 3, 4 as children to Component

h('div', ComponentFunction)
// ComponentFunction will become a Component

h('div', Component)
// is identical to h('div', h(Component))

h('@fragment', 'Hello', 'World')
// the only requirement here is that the first
// letter be a '@' thus so the above could also be re-written as

h('@foo', 'Hello', 'World')

// you could also write all of the above by hand in its compiled form
// when trying to skews the most out of performance.

{
	nodeType: 1, // where nodeType is either 1 'Element' or 3 'TextNode'
	type: 'div',
	props: {},
	children: [
		{
			nodeType: 3,
			type: 'text',
			props: {},
			children: ['Hello World']
		}
	]
}

// is the compiled form that .createElement/h will output
h('div', 'Hello World');
```

---

## dio.createClass

```javascript
dio.createClass({Function|Object})

// or ES6 classes
// the only difference to react is that
// this works exactly like you would expect of
// .createClass
class Component extends dio.Component {
	render() {

	}
}

// examples
var myComponent = dio.createClass({
	render: () => { return h('div') }
});

// with a function
var myComponent = dio.createClass(function () {
	return {
		render: () => { return h('div') }
	};
});

// with a class
class myComponent extends dio.Component {
	render() {
		return h('div')
	}
}

```

---

## dio.render

```javascript
dio.render(component: {function|Object},mount?: {string|Element})

// where component is either a hyperscript object 
// or an object with a render method that returns a hyperscript object 
// or a function that returns one of the above.

// While mount is either a selector, element
// if left blank this defaults to document.body within the browser context
// server-side this will return a function that returns html ouput

// dio.render(...) returns a render instance that can be executed anytime
// you require a re-render, this render instance{Function} 
// accepts 1 optional argument
var instance = dio.render(Component);
instance(props: {Object});

// you can also create a render in the following ways
dio.render(h(Component, {...props}, ...children));
```

component examples.

```javascript
// function that returns a hyperscript object
function () {
	return h('div', 'Hello World')
}

// function that returns an object
function () {
	return {
		render: function () {
			return h('div', 'Hello World')
		}
	}
}

// hyperscript
h('div', 'Hello World');

// object with render method 
{
	render: function () {
		return h('div', 'Hello World')
	}
}

// create component with object
dio.createClass({
	render: function () {
		return h('div', 'Hello World')
	}
})

// create component with function
dio.createClass(function () {
	return  {
		render: function () {
			return h('div', 'Hello World')
		}
	}
})

// extend Component
class Component extends dio.Component {
	constructor(props) {
		super(props)
	}
	render() {
		return h('div', 'Hello World')
	}
}
```

Components created with `.createClass/extends dio.Component` are
statefull by default. There are also other scenarios that pure functions
may become statefull, below are some examples.

```javascript
function Pure () {
	return {
		render: function () {
			return h('h1');
		}
	}
}

function Parent () {
	return {
		render: function () {
			return h('div', Pure);
		}
	}
}

var render = dio.render(Pure);
// or
var render = dio.render(Parent);

// since pure returns an object with a render method
// it will now become a statefull component.
// this means that from within Pure if we call this.forceUpdate
// it will update Pure's corresponding dom element

// so if a pure function that returns an object with a render method
// is placed as is into either .render, .createClass, .createClass 
// or even in h() children it will become a statefull component.
```

Note that in the getting started section 'Hello World'
we did not create a component with `dio.createClass()`
but rather just used a pure function that we passed
to `dio.render(here)` this is because
`.render` will create a component if 
what is passed to it is not already a component as detailed above.

mount examples.

```javascript
document // the document, defaults to document.body
document.body // a dom node
document.querySelector('.myapp') // a dom node
'.myapp' // a selector
document.createElement('div') // a created element
document.createDocumentFragment(); // a document fragment

// or even a function
function el () {
	return document.body;
}

dio.render(__, mount);
// note that the default mount is document.body if nothing is passed.
```

> How do i render one component within another?

Components are for the most part functions(statefull/stateless),
to render place them `h('div', A)` or `h('div', h(A, {}, []))`.

_note: render instances(created with .render) are not components_

```javascript
// note about refs

function () {
	var elementHolder = dio.stream();

	return {
		render: function () {
			return h('div', {ref: elementHolder},
						Foo({text: 'Hello'}),
						Bar({text: 'World'})
					)
		}
	}
}

// In the above parent component we additionally assign
// a ref prop to our parent div, the ref works
// as it would in react, if it is a string
// you can access it with this.ref.name
// if it is a function the element/node is passsed to the function
// but since elementHolder is a stream
// when the element node is passed to it
// elementHolder will now container the element
// thus executing elementHolder() will return the element

```

---

## dio.router

```javascript
dio.router(
	routes: {(function|Object)},
	rootAddress: {string=}, 
	onInit: {(string|function)=},
	mount: {(string|Node)=}
	middleware: {function} 
	// arguments passed: component/callback, data, mount, uri
)

// or
dio.router({(function|Object)}, {
	root: {string=}, 
	init: {(string|function)=},
	mount: {(string|Node)=}
	middleware: {function}
})

// routes is a object of key -> component/callback pairs
```

example router

```javascript
dio.router({
	'/': function (data) {
		dio.render(h(home, data))
	},
	'/user/:id': function (data) {
		dio.render(H(user, data));
	}
}, '/backend', '/user/sultan')

// The above firstly defines a set of routes
// '/' and '/user/:id' the second of which features a data attribute
// that is passed to the callback function (data) in the form
// {id: value} i.e /user/sultan will output {id: 'sultan'}
// '/backend' specifies the root address to be used
// i.e your app lives in url.com/backend rather than on the root /
// and the third argument '/user/sultan' specifies
// an initial route address to navigate to
// initially. The last two arguments are optional.
// you can also pass a function that retuns an object of routes.

// uri -> component example
dio.router({
	'/': ComponentA,
	'/user/:id': ComponentA
}, {
	mount: document.body
});
```

You can then assign this route to a variable and use it to navigate across views

```javascript
var myrouter = ...

myrouter.nav('/user/sultan')
myrouter.go(-2) // like calling myrouter.back() twice
myrouter.back()
myrouter.forward()
```

---

## dio.createStore

```javascript
dio.createStore(
	// single or multiple reducers
	// if an object of reducers, combineReducers is called to combine them
	reducer: {(function|Object)}, 
	// initialState/middleware
	initalState: {Any}          
	// middleware, applyMiddleware is called 
	// on the enhancer function internally
	enhancer: {Function}        
)
```


Rather exactly like redux createStore
with the different of `.connect` that accepts a component & mount/callback
with which to update everytime the store is updated.
Which is mostly a short hand for creating a listerner with `.subscribe`
that updates your component on state changes.

```javascript
var store = dio.createStore(reducer: {Function})
// or

// auto .combineReducers
var store = dio.createStore(object of reducers: {Object})

// dispatch an action
store.dispatch({type: '' ...})

// returns the current state
store.getState()

// called everytime the state is updated with the current
// state as the only argument passed to it... as in
// function (state) {  }
store.subscribe(listener: {Function})

// if the callback is a component, a render will get auto created
// if element is passed the callback will be treated as a component
// and it follows that a render will get auto created
store.connect(callback: {function})
store.connect(callback: {(function|Object)}, element: {(string|Node)})
```

---

## dio.renderToString

Like the name suggests this methods outputs the html 
of a specific component with the props passed
to it, this is normally used within the context of server-side rendering.
When used as a server-side tool add the attribute `data-hydrate` 
to the container you wish to ouput the html, this will allow DIO to
hydrate the current dom on initial mount.

```javascript
dio.renderToString(h('div', 'Text'));
```

---

## dio.stream

```javascript
dio.stream(store: {Any|Function}, mapper);
// if you specify a mapper/processor
// the store will be passed to mapper everytime you
// retrieve a store
// this means you can do

var alwaysString = dio.stream(100, String);
alwaysString() // => '100' {String}


var foo = dio.stream('initial value')
// => changes the store and returns the stream
foo('changed value') 
// thus you  can chain
foo('changed')('again')

foo() // => 'again'

// map
var bar = foo.map(function(foo){
	return foo + ' and bar';
});

bar() // => 'changed value and bar';
foo('hello world')
bar() // => 'hello world and bar'

// combine two or more streams
var faz = dio.stream.combine(function(foo, bar, prevValueOfFaz){
	return foo() + bar();
}, foo, bar); // or an array

foo(1)
bar(2)

faz() // => 3

// listen for changes to a value
// note: this behaves like a promise but it is not a promise
faz.then(function(faz){
	console.log(faz);
});

faz('changed') // => 'changed'

// or chained
faz.then(fn).then(fn)....

// like Promise.all, will run 'fn' after all dependencies have resolved
dio.stream.all([dep1, dep2]).then(fn);

// access resolve and reject
var async = dio.stream(function (resolve, reject) {
	setTimeout(resolve, 500, 'value');
});

// resolve(value) assigns a value to the stream
// reject(reason) signals a rejection within the stream

// for example
var async = dio.stream(function () {
	setTimeout(reject, 500, 'just because');
}).then(function (value) {
	console.log(value + 'resolved')
}).catch(function (reason) {
	console.log('why:' + reason)
});

// In the above code only the catch block will run
// .catch and .then blocks can return values that are
// passed to the next .catch / .then block.
// For example
var foo = dio.stream(function (resolve, reject) {
	//...create xhr request object
	xhr.onload  = resolve;
	xhr.onerror = reject;
	xhr.send();
});

foo.then(function (value) { return 100 })
	.then(function (value) { console.log(value+20) }) // => 120
	.catch(function (value) { return 100 })
	.catch(function (value) { console.log(value+200) }) // => 300

// in the above if there are no errors the then blocks will execute
// in order, the first passing it's return value to the next
// the same happens if there is an error but with the catch blocks

// .scan
var numbers = stream();
var sum = stream.scan(function(sum, numbers) { 
	return sum + numbers();
}, 0, numbers);

numbers(2)(3)(5);
sum(); // => 10
```

---

## dio.curry

```javascript
var foo = dio.curry(
	fn: {function}, 
	args...: {any[]}, 
	preventDefault: {boolean}, 
)
// passing preventDefault triggers e.preventDefault() 
// if function is called as an event listener
// for example:
onClick: dio.curry(
		(a) => {'look no e.preventDefault()'}, 
		['a'], 
		true
	)

// which allows us to do something like
function DoesOneThing (component, arg1, arg2) {
	// ... do something with arg1 and arg2
	// 'this' is the element that triggered the event
	component.setState({...});
}

// then in render
h('input', {
	onInput: dio.curry(DoesOneThing, [this, 1, 2], true)
})
```

---

## dio.createFactory

```javascript
dio.createFactory(element);
```

Like it would work in react createFactory returns a function that 
produces a hyperscript element of a single given type.

```javascript
var div = dio.createFactory('div');

// now instead of
h('div', 'Hello World');
// it becomes possible to use the following
div('Hello World');
```

---

## dio.request

a http helper that makes ajax requests.

```javascript
// returns a stream
dio.request(
	url: {String}, 
	payload?: {Object},

	// 'file' | 'json' | 'text',
	// default: 'application/x-www-form-urlencoded'
	enctype?: {String}, 

	// true/false
	// that indicates whether CORS requests should be made 
	// using credentials such as cookies, 
	// authorization headers or TLS client certificates.
	withCredentials?: {Boolean} 
)

// example

dio.request.post('/url', {id: 1234}, 'json')
	.then((res)=>{return res})
	.then((res)=>{'do something'})
	.catch((err)=>{throw err});

// request also accepts an opbject descriping the request
dio.request({
	method: 'GET',
	url: '/url',
	payload: {id: 1234},
	enctype: 'json',
	withCredentials: false
}).then((res)=>{return res}).catch((err)=>{throw err});
```

---

## dio.animateWith

```javascript
dio.animateWith.flip(
	className:       {string}, 
	duration:        {number}, 
	transform:       {string}, 
	transformOrigin: {string}, 
	easing:          {string}
)(
	element: {(Node|string)}
)

dio.animateWith.transitions(
	className: {string},
	type?:     {(string|number|boolean)}
)(
	element: {Node}, 
	callback: {function} => (element: {Node}, transitions: {function})
)
// where type can be a falsey or less than 0 or 'remove' 
// to indicate a removal of the class, the default being add
dio.animateWith.animations(...)
// the same as .transitions but for the css animations 
// triggered with animation: ... property 
// instead of the css transition: ... property
```

for example `dio.animateWith.flip` can be used within a render as follows

```javascript
render: function () {
	return h('.card', 
		{
			onclick: dio.animateWith.flip('active-state', 200)
		}, 
		''
	)
}
```
since `dio.animateWith.flip(...)` returns a function this is the same as

```javascript
dio.animateWith.flip('active-state', 200)(elementNode) // returns duration
``` 

another animation helper is `animateWith.transitions` 
and `animateWith.animations` the callback function 
supplied after the element will execute after the
resulting animation/transition from adding/removing the class completes.

```javascript
// within a method
handleDelete: function (e) {
	var element = e.currentTarget,
		self = this
	
	// animate element out then update state
	dio.animateWith.transitions('slideUp')(element, function(next, el) {
		store.dispatch({type: 'DELETE', id: 1234});
		// we can also nest another transtion using the second arg
		// el will be the element we passed to it
		next('slideLeft')(el, function (el, next) {
			// we can also trigger the animation 
			// that results in removing the class
			next('slideLeft', -1)(el);
		});
	})
}
```

---

## dio.PropTypes

validates props passed to components insuring they are 
of the the specificied type. The built in validtors work 
exactly as they do in react land namely.

```javascript
[
	number, string, bool, array, object, func, element, node
	any, shape, instanceOf, oneOf, oneOfType, arrayOf, objectOf
]
```

and you can also create your own validators though 
it should be noted that propTypes/validations are only evaluated 
when `NODE_ENV` or `process.env.NODE_ENV` are defined and set to `'development'`.

```javascript
dio.createClass({
	propTypes: {
		// required
		id: dio.PropTypes.string.isRequired,
		// no required/optional
		name: dio.PropTypes.string,
		// build a custom validator
		custom: function (
			props, 
			propName, 
			displayName, 

			createInvalidPropTypeError, 
			createRequiredPropTypeError
		) {
			if (!/matchme/.test(props[propName])) {
	        	return new Error(
		          	'Invalid prop `' + propName + '` supplied to' +
		          	' `' + displayName + '`. Validation failed.'
	        	);
	      	}
		}
	}
	render: function () {
		// ...
	}
})

// where `createInvalidPropTypeError` and `createInvalidPropTypeError`
// are helper functions that that you can use to create an error message
createInvalidPropTypeError(
	propName: {String}, 
	propValue: {Any}, 
	displayName: {String}, 
	expectedType: {String}
)

createRequiredPropTypeError(
	propName: {String}, 
	displayName: {String}
)

// so instead of the above
return new Error(
  	'Invalid prop `' + propName + '` supplied to' +
  	' `' + componentName + '`. Validation failed.'
);

// we could instead do
return createInvalidPropTypeError(
	propName, props[propName], displayName, 'expected type'
)
```

## dio.injectWindowDependency

injects a mock window object to be used for writting tests for 
features that do not exist outside of the browser enviroment,
like `XMLHttpRequest` and other `#document` operations.

```javascript
// returns whatever is passed
dio.injectWindowDependency({Object})
```

## Utilities

```javascript
addEventListener: // cross-browser addEventListener

bind,             // cross-browser Function.bind
assign,           // cross-browser Object.assign
keys,             // cross-browser Object.keys

assign,           // cross-browser Object.assign
keys,             // cross-browser Object.Keys
reduce,           // cross-browser [].reduce
reduceRight,      // cross-browser [].reduceRight
filter            // cross-browser [].filter
map,              // cross-browser [].map

forEach,          // for each for arrays/objects
slice,            // [].slice
splice            // [].splice, uses pop/shift/push/unshift when optimal
flatten           // flattens an array of any depts

isObject,
isFunction,
isString,
isArray,
isDefined // (not null and undefined)
```