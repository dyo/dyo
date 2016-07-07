# surl.js

#### a light (~5kb) framework that mimics most of the reacts api's with some additions.

- animation helpers (flip & transition)
- ajax requests (callbacks & promises)
- router
- store (redux-ish)
- two-way data binding
- component...mount lifecycles are passed a node
- return a number(ms) within componentWillUnmount to delay the unmount
- props and state are passed to render(props, state)

####Supports: Chrome, Firefox, Safari, IE10+

- *~5kb minified+gzipped.*  
- *~12kb minified.*

--

#### "Hello World"

```javascript
var 
app = new surl,
cmp = app.createClass({render: ()=>{return h('div#id','Hello World')}})
app.render(cmp, document)

```


##.Component

a component can be any object that has a render function that
returns a virtual node i.e

```javascript
var app = new surl(Element|Selector)

var obj = {
	render: function(){
		return {
			type: 'div'
			props: {},
			children: Array | 'String'
		}
	}
}

app.Component(obj)
// or
app.createClass(obj)

```
you can also use the built in hyperscript helper 

```javascript
h('div', {}, ...children | 'Text' | ...component)
```
when adding a component as a child of another you can pass props to that component which will be added to its `this.props`

```javascript
h('div', component({products: [1,2,3]}, 1))

component = app.Component({
	render: function () {
		console.log(this.props)    // {products: [1,2,3]}
		console.log(this.children) // 1
		
		return ('div')
	}
})
```

other ways to create a component

```javascript
function FunctionStyle () {
	var onClick = function () {
		app.route.nav('/router.html')
	}

	return {
		render: function () {
			return h('h1', {onclick: onClick}, this.props.id)
		}
	}
}
// mount
app.Mount(app.Component(FuncStyle), '.app')

function PrototypeStyle () {
	this.onClick = function () {
		app.route.nav('/router.html')
	}

	this.render = function () {
		return h('h1', {onclick: this.onClick}, this.props.id)
	}
}
// mount
app.Mount(app.Component(new PrototypeStyle), '.app')
```

##.Element

hyperscript `h(type, props, children)`

```javascript
h('.card[checked]', {data-id: 1234}, 'Text')
//or
app.Element('.card[checked]', {data-id: 1234}, 'Text')
//or
app.createElement(...)
```
will create 

```html
<div class="card" data-id="1234" checked>Text<div>
```

##.DOM

if you want to save a few keystrokes you can do

```javascript
var app = new surl()
app.DOM()
```
and that will expose all html elements to the window so you can

```javascript
// instead of
h('input', {value: 'hello'})
// you could do
input({value: 'hello'})
// but this also means you can't do
h('input[checked]')
// to replicate that in the nodeName() format you will have to do do
input({checked: true})
```

##.render

```javascript
var app = new surl
app.render(UserComponent, '.selector', {prop: 1, prop2: 2})
```

You can also specify them mount before like

```
var app = new surl('.app')
// or
var app = new surl
app.mount('.app')

app.render(UserComponent, null, {prop: 1, prop2: 2})
```

##.route

```javascript
app.router({routes, mount?, addrs?, init?})

// then access the router with
app.router
- .nav('url')
- .back()
- .foward()
- .go(-Number) || .go(+Number)
- .destroy()
```
example

```javascript
var app = new surl(document)
var a = app.Component({render, state, ...methods})

app.route({
	routes: {
		'/', ComponentA
		'/:user/:action', ComponentB
	}
	mount?: 'selector'|Element
	addrs?: 'root address, i.e /directory'
	init?: 'nav to this route on init, i.e /'
})

app.router.nav('/user/delete')
// will navigate to 'url.com/user/delete'
// if you set addrs: 'example' it will nav to
// 'url.com/example/user/delete'

```

##.req

make ajax requests

```javascript
app.req('url', 'METHOD', {data}, callback?)
//returns a promise if you don't pass a callback, {then, done}

```

for example

```javascript
var a = prop('Hello');
app.req('/user/id').then(a).done( ()=>console.log(a()) )
```
will log the response from `/user/id`


##lifecycles

A react like lifecycle

```javascript
shouldComponentUpdate:     function(nextProps, nextState)
componentWillReceiveProps: function(nextProps)
componentWillUpdate:       function(nextProps, nextState)
componentDidUpdate:        function(prevProps, prevState)

componentWillMount:        function(node)
componentDidMount:         function(node)
componentWillUnmount:      function(node)
```

The main difference is the `componentDidMount` and `componentWillMount` lifecycles will have access to the node.

Additionally with `componentWillUnmount` you can return a duration number(in ms) back to it with which it will use to remove the element from the dom only after that amount of time has elapsed. This allows you to do animations on that node before the node is removed/added, this works well with the `animate.flip()` helper, be advised you can probably do all this with the `animation.transition('className', callback)` helper, where by you call the setState method within the callback that triggers only after the any transitions that have been added through that className are complete.

components also have the react like `this.setState(obj)` which triggers a re-render that updates the dom only if something has changed. There is also an additional `this.setProps(obj)` though unlike setState it does not trigger a re-render.


## helpers


- animate()
- bind()
- trust()


### animate


```javascript
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
		self.setState({items: items})
	})
}
```

### bind

two way state data binding

```javascript
h('input' {oninput: bind('value', this, 'text')})
// bind('propName/attrName', component, 'state key to update')
// which reads like
// bind this inputs value prop to this components state['text'] prop

// will thus change the components state to
// {
//    ...
//    text: [inputs value]
// }
```

### trust

print html entities

```javascript
trust("Home Page &amp; <script></script>")
// Home Page &
// + will add the script tag to the dom
```
so that can be used in a render i.e

```javascript
h('div', trust('<script>alert('Hello World')</script>'))
```

### prop

```javascript
var a = prop('value')
console.log(a()) // => value
a('new value')
a() // => new value
JSON.stringify(a) // => new value
```