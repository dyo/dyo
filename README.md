# DIO.js 

[![dio.js](https://cdn.rawgit.com/thysultan/dio.js/master/docs/layout/assets/logo.svg)](http://thysultan.com/dio)

Dio is a blazing fast, lightweight (~10kb) feature rich Virtual DOM framework.

- ~10kb minified+gzipped
- ~25kb minified

[![CDNJS](https://img.shields.io/cdnjs/v/dio.svg?style=flat)](https://cdnjs.com/libraries/dio)
[![npm](https://img.shields.io/npm/v/dio.js.svg?style=flat)](https://www.npmjs.com/package/dio.js) [![licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/thysultan/dio.js/blob/master/LICENSE.md) [![Build Status](https://semaphoreci.com/api/v1/thysultan/dio-js/branches/master/shields_badge.svg)](https://semaphoreci.com/thysultan/dio-js)
 ![dependencies](https://img.shields.io/badge/dependencies-none-green.svg?style=flat) [![Join the chat at https://gitter.im/thysultan/dio.js](https://img.shields.io/badge/chat-gitter-green.svg?style=flat)](https://gitter.im/thysultan/dio.js)

## Browser Support

* Edge
* IE 9+
* Chrome
* Firefox
* Safari

---


# Installation

#### direct download

```html
<script src=dio.min.js></script>
```

#### CDN

```html
<script src=https://cdnjs.cloudflare.com/ajax/libs/dio/3.0.4/dio.min.js></script>
```

```html
<script src=https://cdn.jsdelivr.net/dio/3.0.4/dio.min.js></script>
```

```html
<script src=https://unpkg.com/dio.js@3.0.4/dio.min.js></script>
```

#### bower

```
bower install dio.js
```

#### npm

```
npm install dio.js --save
```

You can also play with Dio [on this jsbin](http://jsbin.com/lobavo/edit?js,output)

---

# Getting Started

Dio is a blazing fast, lightweight (~10kb) feature rich Virtual DOM framework
built around the concept that any function/object can become a component.

Components in Dio share the same api's as react with a few additions, 
this means that you can easily port both ways between Dio and React as and when needed
without any significant changes to the code base, 
the minimal change in most cases being a simple `React, ReactDOM = dio`.

Having said that Dio can be used as just a "view" library but it does come
self containeed with everything you would need to build an application,
from routing, http requests, server-side rendering to testing, state stores, animations and more.

In that respect this getting started guide aims to show you how to go from zero to hello world in Dio.


## Hello world

```javascript
function HelloWorld () {
	return {
		render: function (props) {
			return h('h1', props.text);
		}
	}
}

dio.render(HelloWorld)({text: 'Hello World'});
```

Will mount a h1 element onto the page the contents of which will be 'Hello World'.

---

# Performance

- [DBmon Benchmark](../../examples/benchmark.html)
- [JS Repaint Perfs](https://mathieuancelin.github.io/js-repaint-perfs/dio/index.html)
- [Benchmark Table Test](../../examples/benchmark-table-test.html)
- [JS Framework Benchmark](../../examples/benchmark-js-framework.html)
- [UI Bench Benchmark](https://localvoid.github.io/uibench/)

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

	// stylesheet, support for style encapsulation
	stylesheet:                () => ''
	
	// methods
	this.forceUpdate:          ()

	// setState is synchronous
	// setState also calls this.forceUpdate
	// setState will execute the optional callback before calling this.forceUpdate
	this.setState:             ({Object}, callback: {function=})

	// non-react methods
	// helper for two-way auto binding
	this.withAttr              ({string|string[]}, {function|function[]})
	// if you've used class Components and want to bind multiple
	// methods `this.method = this.method.bind(), ...more bindings` the following can provides
	// a way to delegate all bindings with this.autoBind(['method1', 'method2', 'method3'])
	this.autoBind              (string[])
}
```

---

## creating hyperscript objects

```javascript
// NOTE: h is an alias for dio.createElement

h(
	type: {String}, 
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
// note: to the same effect you can also return an array from a render function

// you could also write all of the above by hand in its compiled form
// when trying to skews the most out of performance.
{
	nodeType: 1, // where nodeType is either 1 'Element', 3 'TextNode', or 2 'Component'
	type: 'div',
	props: {},
	children: [
		{
			nodeType: 3,
			type: 'text',
			props: {},
			children: 'Hello World'
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

## dio.Component.prototype.stylesheet

Before we continue to server-side rendering to explain the stylesheet signature
that appeared in the schema. It allows use to define a component as follows

```javascript
class Button extends Component {
	stylesheet () {
		return `
			{
				color: black;
				border: 1px solid red;
				padding: 10px;
			}
		`
	}
	render () {
		return button(null, [text('Click Me')]);
	}
}

```
The return value of the stylesheet method when it exists is expected to
be a string representing css for that component.
The returned styles will be applied to every instance of that component.

Behind the scenes when dio first encounters an element with a stylesheet method
it parses the css returned, prefixes(if applicable), namespaces and caches the output of this.
It will then add this output(string) to the document(browser) or template(server-side).

prefixes supported are appearance, transform, keyframes & animation.
@keyframes are namespaced and so are animations to match. Eveything else works
as it would with regular css with the addition of `&{}` and `{}` which match the component itself

for example

```javascript
`
{
	color: 'red'
}
&, & h1{
	color: 'blue'
}
`
// due to css specifity the button will be rendered blue and so will a h1 child of the button
// if the second block where absent the button would have been renderd red.

// all of this plays well with server-side rendering that is discussed in the following section
```

---

## dio.renderToString

Like the name suggests this methods outputs the html 
of a specific component this is normally used for server side rendering.
When used as a server-side tool adding the attribute `hydrate` 
will tell dio to hydrate the present structure.

```javascript
// the method accepsts components, elements and 
// fragments(array of the above)
// the template argument is an optional argument
// when passed dio will render the subject into a {{body}} placeholder
// and any styles into {{style}} placeholder
dio.renderToString(
	subject: {(function|Object|VNode[])}, 
	template: {(string|function)=}
)


// simple use

dio.renderToString(h('div', 'Text'));
// or
dio.renderToString(Component);

// note: dio.render in a server-side enviroment calls and returns
// renderToString's output so you may not need to use renderToString
// explicitly if you are calling .render

// performance 280ms (dio.js) vs 2,683ms (react)

// advanced server-side use

const http = require('http');
const dio  = require('./dio.js');

const {Component, renderToString} = dio;
const {button, text, h1} = dio.DOM(['button', 'h1', 'text']);

class Button extends Component {
	stylesheet () {
		return `
			{
				color: black;
				border: 1px solid red;
				padding: 10px;
			}
		`
	}
	render () {
		return button(null, [text('Click Me')]);
	}
}

class Heading extends Component {
	render () {
		return h1(null, [text('Hello World')])
	}
}

const body = renderToString([Heading, Button], `
	<html>
		<head>
			<title>Example</title>
			{{style}}
		</head>
		<body hydrate>
			{{body}}
		</body>
	</html>		
`);

// or using a function
const body = renderToString([Heading, Button], function (body, style) {
	return `
		<html>
			<head>
				<title>Example</title>
				${style}
			</head>
			<body hydrate>
				${body}
			</body>
		</html>		
	`;
});

// server
http.createServer(function(request, response) { 
    response.writeHeader(200, {"Content-Type": "text/html"});  
    response.write(body);  
    response.end();  
}).listen(3000, '127.0.0.1');

// will yield the following
`
	<html>
		<head>
			<title>Example</title>
			<style id="ButtontJroa">[scope=ButtontJroa] {color:black;border:1px solid red;padding:10px;}</style>
		</head>
		<body hydrate>
			<h1>Hello World</h1><button scope="ButtontJroa">Click Me</button>
		</body>
	</html>		
`

// where `ButtontJroa` is the generated scope name of the that components namespace
// that every instance of the component will inherit styles from
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
	// arguments passed: component/callback, data, uri
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

// The above firstly defines a set of routes you could optionally also just pass a function
//  that returns an object of routes.
// '/' and '/user/:id' the second of which features data
// that is passed to the callback function (data) in the form
// {id: value} i.e /user/sultan will output {id: 'sultan'}
// '/backend' specifies the root address to be used
// for example if your app lives on url.com/backend rather than on the root /
// and the third argument '/user/sultan' specifies
// an initial route address to navigate to. The last two arguments are optional.

// or pass a component
// note: if you don't supply a mount this will default to document.body
dio.router({
	'/': ComponentA,
	'/user/:id': ComponentA
}, {
	mount: document.body
});
```

You can then assign this route to a variable and use it to navigate across views

```javascript
var router = dio.router({
	'/': () => {...}
	'/user/:id': () => {...}
});

// navigate to
router.nav('/user/sultan')

// history back
router.back()

// identical to calling myrouter.back() twice
router.go(-2)

// histroy forward
router.forward()

// will create a callback attached to href attribute
router.link('href')

// for example
h('h1', {onClick: router.link('href'), href: '/'}, 'Home')
// or a url
h('h1', {onClick: router.link('/'), href: '/'}, 'Home')
// the argument could also be a function
h('h1', {onClick: router.link(el => el.getAttribute('href')), href: '/'}, 'Home')

// note the this context of the function is the element 
// so you could also write it in the following way
h('a', {href: '/about', onClick: router.link(
	function () {
		return this.getAttribute('href');
	}
)});

// since you can create multiple routes on a single view you could potentially
// have one part of the page mount to one container and one to another each
// responding independently to their respective routing descriptors.
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

## dio.defer

```javascript
var foo = dio.defer(
	fn: {function}, 
	args...: {any[]}, 
	preventDefault: {boolean}, 
)
// passing preventDefault triggers e.preventDefault() 
// if function is called as an event listener
// for example:
onClick: dio.defer(
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
	onInput: dio.defer(DoesOneThing, [this, 1, 2], true)
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

## dio.findDOMNode

Given a component findDOMNode will return the dom node
attached to that component if the component is mounted.

```javascript
class Component extends dio.Component {
	componentDidMount(){
		var node = dio.findDOMNode(this);
	}
	render(){
		return h('div')
	}
}
```

---

## dio.DOM

creates common element factories

```javascript
var {div, li, input} = dio.DOM();

// instead of
h('div', {}, [div('input')])

// you can now do the same with
div({}, [input()])

// the common elements exported are
[
	'h1','h2','h3','h4','h5', 'h6','audio','video','canvas',
	'header','nav','main','aside','footer','section','article','div',
	'form','button','fieldset','form','input','label','option','select','textarea',
	'ul','ol','li','p','a','pre','code','span','img','strong','time','small','hr','br',
	'table','tr','td','th','tbody','thead',
];

// you can supply dio.DOM([...]) your own list of elements
// that will overwrite what elements are exported.


// if you supply a ['svg'] in the array of elements the following 
// list of svg elements will get exported aswell.
[
	'rect','path','polygon','circle','ellipse','line','polyline','image','marker','a','symbol',
	'linearGradient','radialGradient','stop','filter','use','clipPath','view','pattern','svg',
	'g','defs','text','textPath','tspan','mpath','defs','g','marker','mask'
];
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
	withCredentials?: {Boolean},

	// initial value of the returned stream before the request completes
	initial?: {Any},

	// exposes xhr object for low level access before the request is sent
	config?: {Function},

	// username & password for HTTP authorization
	username?: {String}, 
	password?: {String}
)

// example
dio.request.post('/url', {id: 1234}, 'json')
	.then((res)=>{return res})
	.then((res)=>{'do something'})
	.catch((err)=>{throw err});

// request accepts an object aswell
dio.request({
	method: 'GET',
	url: '/url',
	payload: {id: 1234},
	enctype: 'json',
	withCredentials: false,
	config: function (xhr) {
		xhr.setRequestHeader('x-auth-token',"xxxx");
	}
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
	dio.animateWith.transitions('slideUp')(element, function(el, next) {
		store.dispatch({type: 'DELETE', id: 1234});
		// we can also nest another transtion using the second arg
		// el will be the element we passed to it
		next('slideLeft')(el, function (el, next) {
			// we can still trigger the animation 
			// that results in removing the class
			// and nest another transition as much as we nest the callback chain
			// -1, false and 0 represent remove operations
			// undefined(left blank), true, 1, anything truefy represents add operations
			next('slideLeft', -1)(el);
		});
	})
}
```

---

## dio.PropTypes

validates props passed to components insuring they are 
of the the specificied type. The built in validtors work 
exactly as they do in react land namely...

```javascript
[
	number, string, bool, array, object, func, element, node
	any, shape, instanceOf, oneOf, oneOfType, arrayOf, objectOf
]
```

It should however be noted that propTypes/validations are only evaluated 
when `process.env.NODE_ENV` is set to `'development'` or
if you set `dio.enviroment = 'development'`

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
// when creating your own custom propType
createInvalidPropTypeError(
	propName:     {string}, 
	propValue:    {any}, 
	displayName:  {string}, 
	expectedType: {string}
)

createRequiredPropTypeError(
	propName:    {string}, 
	displayName: {string}
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

## dio.window

assigns a mock window object to be used for writting tests for 
features that do not exist outside of browser enviroment,
like `XMLHttpRequest` and `#document` operations.

```javascript
// returns whatever is passed
dio.window = {Object}
```

## Utilities

```javascript
{
	// throw an error
	panic
	// sandbox a try catch statement
	sandbox
	// compose functions
	compose
	// generate a random string
	random
	// flatten array
	flatten
	// create input stream (used to create the stylsheet parse)
	input        

	// type checking utilities
	isObject 
	isFunction
	isString
	isArray
	isDefined
	isNumber
	isArrayLike
}
```

## Performance Tips

The hyperscript helper `h` for creating vnodes is very versatile,
however if you are trying to draw the most out of performance
the following way of creating vnodes are the most optimal performance wise..

```javascript
// raw vnode object
// this is what all the helpers generate
{
	// where 1 = element, 2 = component and 3 = text
	// elementNodes and textNodes follow the spec with regards
	// to the nodeType signature being 1 and 3 respectfully.
	nodeType: 1,
	type: 'div',
	props: {},
	children: [
		{
			nodeType: 3,
			type: 'text',
			props: {},
			children: 'Hello World' // ony text nodes have non array children
		}
	]
}

// or the V... helpers, the 2nd and 3rd arguments are optinal in all the following
dio.VElement('div', {}, [VText('Hello World')])
dio.VComponent(Component)
dio.VFragment([...])
dio.VSvg({}, [...]) // it's easier to use dio.DOM(['svg']) svg({}) since they perform the same
dio.VText('Content')

// the following helper receives a single VNode or array[] of VNodes
// use this when you want to hoist element for a bump in performance.
// this method returns what is passed to it.
// internally it creates the elements are attaches them to as the `_el` key
// when dio creates elements it always looks to see if a _el is already assign
// in which case it executes a cloneNode instead of createElement action for the respective node
dio.VBlueprint(vnode);
```