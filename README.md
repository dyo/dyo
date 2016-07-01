# surl.js
-

- safe templates,  
- animations.
- router.
- components.
- hyperscript.
- opt in/out auto render. 

#####Supports: Chrome, Firefox, Safari, IE10+

- *~4kb minified+gzipped.*  
- *~9kb minified.*

##core

```javascript
var app = new surl(selector|Element|Empty)
```

```javascript
var element = document.createElement('div');
	element.classList.add('app');
```
you can then mount an element in the following way

```javascript
app.parent = element;
app.Mount(simple)
```
or you can mount to an element like this

```javascript
app.Mount(simple, element);
```

or when you init

```javascript
var app = new surl(element|selector) 
```
you can also pass a selector

```javascript
var app = new surl('.app')
```
then 

```javascript
app.Mount(simple)

```
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

```
you can also use the built in hyperscript helper 

```javascript
h('div', {}, ...children | 'Text' | ...component)
```
when adding a component as a child of another you can pass props to that component that will be added to `this.props`

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

##router

```javascript
app.Router

// ? = optional
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

app.router.on('/', a)
app.router.on('/:user/:action', (args) => {console.log(args.user, args.action)})

app.Route({
	routes: {
		'/', ComponentA
		'/:user/:action', ComponentB
	}
	mount?: 'selector'|Element
	addrs?: 'root address, i.e /directory'
	init?: 'nav to this route on init, i.e /'
})

app.nav('/user/delete')
// will navigate to 'url.com/user/delete'
// if you set addrs: 'example' it will nav to
// 'url.com/example/user/delete'

```


-
##hyperscript

hyperscript `h(type, props, children)`

```javascript
h('.card[checked]', {data-id: 1234}, 'Text')
//or
app.Element('.card[checked]', {data-id: 1234}, 'Text')
```
will create 

```html
<div class="card" data-id="1234" checked>Text<div>
```

##animation

given an end state "a class", you can "FLIP" animate an Element.

```javascript
animate(duration, className, transform, transformOrigin, easing)(Element)
```

can be used within a render as follows

```javascript
render: function () {
	return h('.card', 
	{onclick: animate(200, 'active-state')}, 
	''
	)
}
```
since animate(...) returns a function this is the same as

```javascript
animate(200, 'active-state')(Element)
``` 

##req

make ajax requests

```javascript
app.Req('/', 'GET', function (res, err) {
	// res{Element|JSON|Text}
	// err{Boolean}
})

app.Req('/', 'POST', {id: 1245}, function (res, err) {
	
})
```

##bind

two way state data binding

```javascript
h('input' {oninput: bind('value', this, 'text')})
// bind('propName/attrName', component, 'objects key to update')

// will change the components state to
// {
//    text: [value]
// }
```

##trust

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


##lifecycle

A react like lifecycle

```javascript
componentWillMount: function()
componentDidMount: function()
componentWillReceiveProps: function(nextProps)
componentWillUpdate: function(nextProps, nextState)
componentDidUpdate: function(prevProps, prevState)
componentWillUnmount: function()
```

components also have the react like `this.setState(obj)` which triggers a re-render that updates the dom only if something has changed. There is also an additional `this.setProps(obj)` though unlike setState it does not trigger a re-render.

##DOM

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