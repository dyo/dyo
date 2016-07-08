# surl.js

##### a light performant (~6kb) vdom framework.s.

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
		
		}
	}
}
// or a plain object
var TodoApp = {
	render: function (props) {
	}
}

// create a render mapper
var render = s.render(TodoApp, '.app')
// or
var render = s.render((props) => h('div', props.children), '.app')

// call it anytime you want to render to the dom
render(...props, children, forceUpdate?)

// forceUpdate{Boolean} tells the render to force an initial mount
// which clears the element and mounts to it.
// this is by default executated on the initial render/ first time you
// call the render instance
```

## s.render

create a render function that can be called anytime you need to render to the dom, s.render doesn't really care if you wrap your component in `s.comp(User)` or if it's just a function that returns a vdom node when executed.

```javascript
var Sidebar = s.render(User, '.side-bar')
var Header = s.render(Header, '.header')

// where User & Header are either functions that return 
// an object with a render method or an object with a render method
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

## s.DOM

save a few keystrokes

```javascript

s.DOM()
```
and that will expose all html elements to the window

```javascript
// instead of
h('input', {value: 'hello'})
// you could do
input({value: 'hello'})
```


## s.route

create a router

```javascript
var myrender = s.render(Function, 'selector|element')
var myrouter = s.router({
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
## s.request

create an http helper

```javascript
var request = s.request()

request.get('/url/id', callback)
request.post('/url/id', {data:1}, callback)

var a = prop('hello')
request.get('/url/id').then(a).done(()=>console.log(a))
// a => response

```

## s.store

```javascript
var render = s.render(MyComponent, '.app')

var store = s.store(reducer => {})
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
var animate = s.animate()

animate.flip(className, duration, transform, transformOrigin, easing)(Element)

animate.transition(className)(node, callback)
```

for example `animate.flip` can be used within a render as follows

```javascript
render: function () {
	return h('.card', 
	{onclick: animate.flip('active-state', 200)}, 
	''
	)
}
```
since `animate.flip(...)` returns a function this is the same as

```javascript
animate('active-state', 200)(Element) // returns duration
``` 

another animation helper being `animate.transition`

```javascript
// within a method
handleDelete: function () {
	var 
	node = e.currentTarget,
	self = this
	
	// animate node out then update state
	animate.transition('slideUp')(node, function(){
		store.dispatch({type: 'DELETE', id: 1234})
	})
}
```

### s.trust

print html entities

```javascript
s.trust("Home Page &amp; <script></script>")
// Home Page &
// + will add the script tag to the dom
```
i.e

```javascript
h('div', trust('<script>alert('Hello World')</script>'))
```

### s.prop

```javascript
var a = s.prop('value')
console.log(a()) // => value
a('new value')
a() // => new value
JSON.stringify(a) // => new value
```

### .toHTML

```javascript
var render = s.render(MyComponent, '.className')
document.write(render(props, state, forceUpdate, true).toHTML())
// or simple
document.write(render(props, state, 'html'))
// => prints the components html to the page without mount
// it to the dom

// The second one is just a shorter syntax for the first
// note: the first 'render(props, state, .., true)' just
// returns the render hyperscript
// but every render's parent hyperscript has a .toHTML
// that converts it to html
```