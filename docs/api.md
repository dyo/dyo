# API Reference

## a components schema

```javascript
{
	// lifecycle methods
	shouldComponentUpdate:     (props, state, this) => {}
	componentWillReceiveProps: (props, state, this) => {}
	componentWillUpdate:       (props, state, this) => {}
	componentDidUpdate:        (props, state, this) => {}
	componentWillMount:        (props, state, this) => {}
	componentDidMount:         (props, state, this) => {}
	componentWillUnmount:      (node)
	
	// this.methods
	this.withAttr              ({String|String[]}, {Function|Function[]})
	this.forceUpdate:          (this?: {Object})
	this.setState:             ({Object})
	this.setProps:             ({Object})

	// render method
	render:                    (props, state, this) => {}
}
```

## dio.createRender

```javascript
dio.createRender(component: {Function|Object}, mount?: {String|Element})
// where component is either a hyperscript object 
// or an object with a render method that returns a hyperscript object 
// or a function that returns one of the above.

// While mount is either a selector or element reference
// if left blank this defaults to document.body
```

Components that do not return an object with a render function
or are itself an object with a render function will not feature
the component lifecycles and methods as presented above in the schema

Now lets go over some component examples.

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

dio.createRender(componentPlaceholder)
```

Now lets go over some mount examples

```
document || document.querySelector('.myapp')
'.myapp'

dio.createRender(__, mountPlaceholder)

// note that the default for mount is document.body
// and when you pass document to the mount it defaults to document.body
// since you can't mount elements directly to the document
// so if you ever want to pass document / .body as a mount leave it blank
// and the default would be document.body
```

---

## dio.createRouter

```
dio.createRouter(routes: {Object}, rootAddress?: {String}, onInitNavTo?: {String})
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
// '/' & '/user/:id' the second of which feature s data attribute
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
will mount with which to update everytime the store is updated.
Which is mostly a short hand for creating a listerner with `.subscribe`
that updates your component on state changes.

```
var store = dio.createStore(reducer)

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

## dio.exposeDOM

This method exposes all html elements to the global namespace or
only the elements supplied to it.

```
// before
h('input', {value: 'Hello World'})

dio.exposeDOM()
// after
input({value: 'Hello World'})

// you can also specify a specific set of elements to expose
dio.exposeDOM('input', 'div', 'svg')
```

---

## dio.request

make ajax requests

```
// returns a stream
dio.request(
	url: {String}, 
	payload?: {Object},
	enctype?: {String}, 
	// 'file' | 'json' | 'text', default: 'application/x-www-form-urlencoded'
	callback?: {Function}, 
	withCredentials?: {Boolean} 
	// true/false for CORS requests 
)

// example

dio.request('/url')
	.then((res)=>{return res})
	.then((res)=>{'do something'})
	.catch((err)=>{throw err});

```

---

## dio.stream

```
var foo = dio.stream('initial value')
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
var faz = dio.stream.combine(function(fooValue, barValue){
	return foo + bar;
}, foo, bar);

foo(1)
bar(2)

faz() // => 3

// listen for changes to a value
faz.then(function(fazValue){
	console.log(fazValue)
});

faz('changed') // => 'changed'

// or chained
faz.then(fn).then(fn)....
```

---

## dio.curry

```
var foo = dio.curry((a, b)=>{}, ['a', 'b'], event: {Boolean})
// setting the event argument does a preventDefault if the caller is an event
// for example:

onClick: dio.curry((a) => {'look no e.preventDefault()'}, ['a'], true)

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