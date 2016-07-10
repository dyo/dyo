# dio.js

##### a light performant (~6kb) vdom framework.

- animations (flip & transition)
- requests (with callbacks / promises)
- router
- store


#####Supports: Chrome, Firefox, Safari, IE10+

- *~6kb minified+gzipped.*  
- *~13kb minified.*


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
- .nav('url')
- .back()
- .foward()
- .go(-Number) || .go(+Number)
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
// an keep it update to date anytime an action is dispatched
// to the store

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

`componentWillUnmount` can receieve(return) a duration number(in ms) back to it used to remove the element from the dom only after that amount of time has elapsed. This allows you to do animations on that node before the node is removed/added, this works well with the `animate.flip()` helper, though be advised you can probably do all this with the `animation.transition('className', callback)` helper.


## helpers


- animate()
- bind()
- trust()


### animate


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

### dio.prop

```javascript
var a = dio.prop('value')
console.log(a()) // => value
a('new value')
a() // => new value
JSON.stringify(a) // => new value
```

### .toHTML

```javascript
var render = dio.render(Users, '.app')
document.write(render(props, state, 'html'))
// => prints the components html to the page without mounting
// it to the dom
```