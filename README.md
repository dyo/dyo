# dio.js

##### a light (~6kb) Virtual DOM framework.

- animations (flip & transition)
- requests (with callbacks / promises)
- router
- store


#####Supports: Chrome, Firefox, Safari, IE10+

- *~6kb minified+gzipped.*  
- *~14kb minified.*


--

#### "Hello World"

```javascript
// a function that returns a object with render
function TodoApp () {
	return {
		render: function (props) {
			return h('h1', 'Hello World')
		}
	}
}
// or a plain object
var TodoApp = {
	render: function (props) {
		return h('h1', 'Hello World')
	}
}

// create a render instance
var render = dio.render(TodoApp, '.app')


// call it when you want to render to the dom
render(...props?, children?, forceUpdate?)

// forceUpdate{Boolean} tells the render to force an initial mount
// which clears the element and does an initial mount to it.
// this is by default only executated on the initial render/ first time you
// call the render instance.
```

--


## dio.render

create a render function that can be called anytime you need to render to the dom.

```javascript
var Sidebar = dio.render(User, '.side-bar')
var Header = dio.render(Header, '.header')

// where User & Header are either functions that return 
// an object with a render method or an object with a render method
// or alternatively it could just be a function that returns a
// hyperscript object.

Sidebar(props, children)
// renders Sidebar to .side-bar passing in props and children
// however there is a third param{Boolean} you can pass
// that explicity forces an update/initial mount.
```


## h(type, props, children)

creates vdom nodes

```javascript
h('.card[checked]', {data-id: 1234}, 'Text')
```
creates

```html
<div class="card" data-id="1234" checked>Text<div>
```

## dio.DOM

save a few keystrokes

```javascript

// exposes all html elements to the global namespace
dio.DOM()

// exposes only the input element to the global namespace
dio.DOM('input')

```


```javascript
// instead of
h('input', {value: 'hello'})
// you could do
input({value: 'hello'})
```


## dio.route

create a router

```javascript
var myrender = dio.render(Function, 'selector|element')
var myrouter = dio.router({
	root: '/examples',
	nav: '/start',
	routes: {
		'/:user/:id': (data) => {
			myrender(data)
		}
	}
})

// then access the router with
myrouter
  .nav('url')
  .back()
  .foward()
  .go(-Number) || .go(+Number)
```
## dio.request

a http helper

```javascript
dio.request.get('/url/id', callback)
dio.request.post('/url/id', {data:1}, callback)

var a = prop('hello')
dio.request.get('/url/id').then(a).done(()=>console.log(a))
// a => response

```

## dio.store

```javascript
var render = dio.render(MyComponent, '.app')
var store = dio.store(reducer => {})

store.subscribe(() => { render(store.getState()) })
store.dispatch({type: 'ADD'})
// render will mount/render/update
// anytime you dispatch an action

// or all that in one line
store.connect(render)

// will mount the component to the dom with the initial state
// returned by .getState()
// and keep it update to date anytime an action is dispatched
// to the store

```

## dio.stream

create, combine and map streams.

```javascript
create:   A = dio.stream(value)
map:      A.map((a)=>{})
combine:  dio.stream.combine((A, B)=>{}, A, B)
then:     A.then((a)=>{})
```

create a stream

```javascript
var a = dio.stream('value')
console.log(a()) // => value
a('new value')
a() // => new value
JSON.stringify(a) // => new value
```
This becomes more powerfull the further we take it.
For example imagine i want to create a stream that carries a value that
should always be of a string type:

```javascript
var a = dio.stream(1234, String)
a() // => '1234'

// note that this returns a string instead of a number
// because we specified a processor that returns a processed 
// stored value, the above is equivalent to

String(a())

```
I could then pass this stream `a` to a promise i.e

```javascript
fetch('...').then(a)
```
That will update the value of `a` when a response is returned, 
assuming the response is a number, this value will now be the 
new value of `a` at a future time, we can then map values to `a` that return other values using the current value of `a` at that time such
that when `a` changes their respective returned values use the up-to-date
value of `a`

```javascript
// create a link/map to a stream
var b = a.map(function (value) {
		return value + ' mapper'
	})
	
b()  // => '1234 mapper'

// (time elapsed) the fetch response has returned a response 5000{Number}

b()  // => '5000 mapper'

// if b's map contents was: 'return value + 1000' the value of b()
// should be '50001000' and not 6000
// since we specified that 'a' should
// always return a string
```
We can take this further to then create a stream that is linked or mapped
to one or more streams

```javascript
// a stream that returns value linked to two streams
var c = dio.stream.combine(function(a, b){
	return a + ' ' + b + ' combiner '
}, a, b)

c() //=> '5000 50001000 combiner' 
```

other advanced examples

```javascript
// .map
var stream = dio.stream
var foo = stream('hello ');
var bar = foo.map(function(value){
	return '[bar] ' + value;
});

bar();      // => [bar] hello 
foo('changed');
bar();      // => [bar] changed

var baz = bar.map(function (value){
	return '[baz] ' + value;
});
var faz = baz.map(function (value){
  return '[faz] ' + value;
});

// .combine
var combined = stream.combine(function (foo, faz) {
	return foo + ' ' + faz;
}, foo, faz)

baz();      // => [baz] [bar] changed
faz();      // => [faz] [baz] [bar] changed
combined(); // => changed [faz] [baz] [bar] changed

// .then
var foo = dio.stream('initial value')
foo.then(function(value){
  console.log(value)
})

foo('new value') // => 'new value'

```



## lifecycles

react like lifecycle

```javascript
shouldComponentUpdate:     function(nextProps, nextState)
componentWillReceiveProps: function(nextProps)
componentWillUpdate:       function(nextProps, nextState)
componentDidUpdate:        function(prevProps, prevState)

componentWillMount:        function(node)
componentDidMount:         function(node)
componentWillUnmount:      function(node)
```

`componentDidMount` and `componentWillMount` lifecycles have access to the node.

`componentWillUnmount` can receive(return) a duration number(in ms) back to it used to remove the element from the dom only after that amount of time has elapsed. This allows you to do animations on that node before the node is removed/added, this works well with the `animate.flip()` helper, though be advised you can probably do all this with the `animation.transition('className', callback)` helper.


## helpers


- animate()
- bind()
- trust()


### dio.animate


```javascript
dio.animate.flip(className, duration, transform, transformOrigin, easing)(Element)

dio.animate.transition(className)(node, callback)
```

for example `s.animate.flip` can be used within a render as follows

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

another animation helper being `animate.transition`

```javascript
// within a method
handleDelete: function () {
	var 
	node = e.currentTarget,
	self = this
	
	// animate node out then update state
	dio.animate.transition('slideUp')(node, function(){
		store.dispatch({type: 'DELETE', id: 1234})
	})
}
```

### dio.trust

print html entities

```javascript
dio.trust("Home Page &amp; <script></script>")
// Home Page &
// + will add the script tag to the dom
```
i.e

```javascript
h('div', trust('<script>alert('Hello World')</script>'))
```

### toHTML

```javascript
var render = dio.render(Users, '.app')
document.write(render(props, children, 'html'))
// => prints the components html to the page without mounting
// it to the dom
```
You can also use `dio.toHTML(h('div'))` on a hyperscript object.

On the otherhand if you want a render() instance to return a vnode instead of rendering to the dom or returning html as above you could call it with a 'vnode' string as the third parameter

```javascript
render(props, children,'vnode')
```

which meas that you could alternatively print html like

```javascript
dio.toHTML(render(props, children,'vnode'))
```