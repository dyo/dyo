# API Reference

## components schema

```javascript
{
	// lifecycle methods
	shouldComponentUpdate:     (props, state, this) => {}
	componentWillReceiveProps: (props, state, this) => {}
	componentWillUpdate:       (props, state, this) => {}
	componentDidUpdate:        (props, state, this) => {}
	componentWillMount:        (props, state, this) => {}
	componentDidMount:         (props, state, this) => {}
	componentWillUnmount:      (node) => {}
	
	// this.methods
	this.withAttr              ({String|String[]}, {Function|Function[]})
	this.forceUpdate:          (this?: {Object})
	this.setState:             ({Object})
	this.setProps:             ({Object})

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
```

---

## dio.createComponent

```
dio.createComponent({Function|Object})

// for example
var myComponent = dio.createComponent({
	render: () => { return h('div') }
});

// or with a function
var myComponent = dio.createComponent(function () {
	return {
		render: () => { return h('div') }
	};
});

```

---

## dio.createRender

```javascript
dio.createRender(component: {Function|Object}, mount?: {String|Element})
// where component is either a component
// created with dio.createComponent, 
// a hyperscript object 
// an object with a render method that 
// returns a hyperscript object 
// or a function that returns one of the above.

// While mount is either a selector or element reference
// if left blank this defaults to document.body
```

Components that do not return an object with a render function
or are itself an object with a render function will not feature
the component lifecycles and methods as presented above in the schema.

Lets go over some component examples.

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
h('div', 'Hello World')

// object with render method 
{
	render: function () {
		return h('div', 'Hello World')
	}
}

// create component with object
dio.createComponent({
	render: function () {
		return h('div', 'Hello World')
	}
})

// create component with function
dio.createComponent(function () {
	return  {
		render: function () {
			return h('div', 'Hello World')
		}
	}
})

dio.createRender(componentPlaceholder)
```

Components created with `dio.createComponent` that feature a
render method either returned from a function or within the
object passed to `.createComponent` are statefull by default.

Another thing to note is that in that in the Hello World
example we begin with we did not `dio.createComponent()`
but rather just used a pure function that we passed
to `dio.createRender(here)` this is because
`.createRender` creates a statefull component out of the object/function
we pass to it if it fits the criterion of a statefull component
and a stateless component if it does'nt.

Ok lets quickly go over some mount examples.

```javascript
document || document.querySelector('.myapp')
'.myapp'

dio.createRender(__, mountPlaceholder)

// note that the default for mount is document.body
```

With that out of the way we progress into 

> How do i render one component within another

So since components are just functions(statefull/stateless),
to render them just execute them were needed.
note: 'render instances are not components'

```
// stateless
function Foo (props) {
	return h('h1', props.text)
}

// statefull
var Bar = dio.createComponent({
	render: function (props) {
		return h('h2', props.text)
	}
});

// parent component
function () {
	var elementHolder = dio.createStream()

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
// thus executing it elementHolder() will return
// the element

```

---

## dio.createRouter

```
dio.createRouter(
	routes: {Object}, 
	rootAddress?: {String}, 
	onInitNavTo?: {String}
)
```

example router
```
dio.createRouter({
	'/': function () {
		dio.createRender(home)()
	},
	'/user/:id': function (data) {
		dio.createRender(user)(data)
	}
}, '/backend', '/user/sultan')

// The above firstly defines a set of routes
// '/' and '/user/:id' the second of which feature s data attribute
// that is passed to the callback function (data) in the form
// {id: value} i.e /user/sultan will output {id: 'sultan'}
// '/backend' specifies the root address to be used
// i.e your app lives in url.com/backend rather than on the root /
// and the third argument '/user/sultan' specifies
// an initial route to address that is navigated to
// initially. The last two arguments are optional.
```

You can then assign this route to a variable and use it to navigate across views

```
var myrouter = ...

myrouter.nav('/user/sultan')
myrouter.go(-2) // like calling myrouter.back() twice
myrouter.back()
myrouter.forward()
```

---

## dio.createStore

Alot like redux createStore, inface it's exactly like redux createStore
with the addition of `.connect` that accepts a render insance of component
and mount with which to update everytime the store is updated.
Which is mostly a short hand for creating a listerner with `.subscribe`
that updates your component on state changes.

```
var store = dio.createStore(reducer: {Function})
// or
var store = dio.createStore(object of reducers: {Object})


store.dispatch({type: '' ...})
// dispatch an action

store.getState()
// returns the current state

store.subscribe(listener: {Function})
// called everytime the state is updated

store.connect(render: {Function})
store.connect(render: {Function|Object}, element: '.myapp')
// if you provide an element to .connect it assumes the render
// passed is not a render instance but a component and will then
// proceed to create a render instance.
```

---

## dio.createHTML

Like the name suggests this methods outputs the html 
of a specific component/render instance with the props passed
to it

```
dio.createHTML(component, props, children)
// you can also use this on plain hyperscript objects
```

---

## dio.createStream

```
var foo = dio.createStream('initial value')
foo('changed value')
foo() // => 'changed value'

// map
var bar = foo.map(function(fooValue){
	return fooValue + ' and bar';
});

bar() // => 'changed value and bar';
foo('hello world')
bar() // => 'hello world and bar'

// combine two or more streams
var faz = dio.createStream.combine(function(fooValue, barValue){
	return fooValue() + barValue();
}, foo, bar); // or an array

foo(1)
bar(2)

faz() // => 3

// listen for changes to a value
// note: this behaves kind of like a promise but it is not a promise
// ergo no polyfill needed.
faz.then(function(fazValue){
	console.log(fazValue)
});

faz('changed') // => 'changed'

// or chained
faz.then(fn).then(fn)....

// .all
dio.createStream.all([dep1, dep2]).then(fn);

// access resolve and reject

var async = dio.createStream(function (resolve, reject) {
	setTimeout(resolve, 500, 'value');
});
```

---

## dio.createFunction

```javascript
var foo = dio.createFunction(
	fn: {Function|String}, 
	argumentsPassed: {Any[]|Any}, 
	event: {Boolean}, 
	argumentNames? // used when fn is a string
)
// setting the event argument triggers e.preventDefault() 
// if the caller is an event
// for example:

onClick: dio.createFunction(
		(a) => {'look no e.preventDefault()'}, 
		['a'], 
		true
	)

// you could also pass a string as the function argument
onInput: dio.createFunction(
		'console.log(a, b, c)', 
		[1, 2, 3], 
		true, 
		'a, b, c'
	)
// logs 1, 2, 3

// which allows us to do something like
function DoesOneThing (component, arg1, arg2) {
	// ... do something with arg1 and arg2
	// 'this' is the element that was clicked
	component.setState({...})
}

// one way
...h('input', {
	onInput: dio.createFunction(DoesOneThing, [this, 1, 2], true)
})
// another
...h('input', {
	onInput: dio.createFunction(
		'DoesOneThing(a,b+20,c+10)', 
		[this, 1, 2], 
		true, 
		'a,b,c'
	)
})
```

---

## dio.request

make ajax requests

```javascript
// returns a stream
dio.request(
	url: {String}, 
	payload?: {Object},

	// 'file' | 'json' | 'text', default: 'application/x-www-form-urlencoded'
	enctype?: {String}, 
	callback?: {Function}, 

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

```

---

## dio.animate

```javascript
dio.animate.flip(className, duration, transform, transformOrigin, easing)(Element)
dio.animate.transition(className)(node, callback)
```

for example `dio.animate.flip` can be used within a render as follows

```javascript
render: function () {
	return h('.card', 
		{onclick: dio.animate.flip('active-state', 200)}, 
		''
	)
}
```
since `dio.animate.flip(...)` returns a function this is the same as

```javascript
dio.animate('active-state', 200)(Element) // returns duration
``` 

another animation helper is `animate.transition`

```javascript
// within a method
handleDelete: function (e) {
	var 
	node = e.currentTarget,
	self = this
	
	// animate node out then update state
	dio.animate.transition('slideUp')(node, function(){
		store.dispatch({type: 'DELETE', id: 1234})
	})
}
```