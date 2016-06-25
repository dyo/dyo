# surl.js
-

- safe templates,  
- animations.
- router.
- components.
- hyperscript.
- opt in/out auto render. 

#####Supports: Chrome, Firefox, Safari, IE10+

4kb minified+gzipped, 8.8kb minified.

##core

```javascript
var app = new surl(Selector|Element|Empty)
```

```javascript
var element = document.createElement('div');
	element.classList.add('app');
```
you can then mount an element in the following way

```javascript
app.parent = element;
app.mount(simple)
```
or you can mount to an element like this

```javascript
app.mount(simple, element);
```

or you can just

```javascript
app.parent = element;
app.router.on('/', simple)
```

or when you init app

```javascript
var app = new surl(element) 
```
you can also pass a selector

```javascript
var app = new surl('.app')
```
then 

```javascript
app.mount(simple)

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
			children: Array | 'String' | ...component()
		}
	}
}

app.createClass(obj)
//or
app.component(obj)

```
you can also use the built in hyperscript helper 

```javascript
h('div', {}, ...children | 'Text' | ...component)
```
when adding a component as a child of another you can pass props to that component that will be added to `this.props`

```javascript
h('div', component({products: [1,2,3]}))

component = ..createClass({
	render: function () {
		console.log(this.props) // {products: [1,2,3]}
		return ('div')
	}
})
```

You can if need be set `app.settings.loop = false`
to disable auto updates
you can then manually trigger an update in a method i.e

```javascript
var app = new surl('.app');

var component = app.component({
	render: function () {return h('div', this.data)}},
	method: function () {
		this.data = 'Changed'
		app.vdom.update()
		// you can also enable auto updates
		app.vdom.loop(true)
	}
	data: 'Text'
})

app.mount(component)
```

##router

```javascript
// ? = optional
- .on('url', callback/'component object', element?) 
- .on({'/': simple, ...})
- .nav('url')
- .back()
- .foward()
- .go(-Number) || .go(+Number)
- .destroy()
```
example

```javascript
var app = new surl(document)
var a = app.component({render, state, ...methods})
a.router.on('/', a)
a.router.on('/:user/:action', (args) => {console.log(args.user, args.action)})
```
-
##hyperscript

hyperscript `h(type, props, children)`

```javascript
h('.card[checked]', {data-id: 1234}, 'Text')
```
will create ```<div class="card" data-id="1234" checked>Text<div>```

##animation
```javascript
animate(El, [](transforms), 200(time), 'end'(class), '0,0.2,0.2,0'(cubic-easing))
```

can be used within a render follows

```javascript
render: function () {
	return h('.card', 
	{onclick: animate.bind(Class|Duration, ['scale(2)'...], '0,0,0,0.3')}, 
	''
	)
}
```

##ajax

```javascript
app.req('/', 'GET', function (res, err) {
	res{Element|JSON|Text}
	err{Boolean}
})

app.req('/', 'POST', {id: 1245}, function (res, err) {
	
})
```