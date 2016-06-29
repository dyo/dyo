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
var a = app.createClass({render, state, ...methods})
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

given an end state "a class", you can "FLIP" animate an Element.

```javascript
animate(El, [](transforms), 200(time), 'end'(class), '0,0.2,0.2,0'(cubic-easing))
```

can be used within a render as follows

```javascript
render: function () {
	return h('.card', 
	{onclick: animate.bind(Class|Duration, ['scale(2)'...], '0,0,0,0.3')}, 
	''
	)
}
```

##req

make ajax requests

```javascript
app.req('/', 'GET', function (res, err) {
	res{Element|JSON|Text}
	err{Boolean}
})

app.req('/', 'POST', {id: 1245}, function (res, err) {
	
})
```

##bind

two way data binding

```javascript
h('input' {oninput: bind('value', this.state, 'text')})
// bind('propName/attrName', object, 'objects key to update')

// this.state = {
//    text: [value]
// }
```

##trust

opt out of safe templates

```javascript
trust("Home Page &amp; <script></script>")
// Home Page &
// + will add the script tag to the dom
```

##lifecycle

A react like lifecycle

- `getInitialState()`
- `getDefaultProps()`
- `componentWillMount()`
- `componentDidMount()`

components also have the react like `this.setState(obj)` which triggers a re-render that updates the dom only if something has changed. There is also an additional `this.setProps(obj)` though unlike setState it does not trigger a re-render.

##settings

```javascript
var app = new surl()
app.settings = {
	auto: false
}
```

If you change `app.settings.auto` to true, it will default to requestAnimationFrame for updates, this means that that whether you call this.setState or not, the component will render 60fps everytime and update the dom anytime there is a change. With this you can model you app in any way. i.e

```javascript
var app = new surl('.app'),
	Foo = app.createClass({
		test: 'Hello World'
		render: function(){
			return h('div', {onclick: bind('innerText', this, 'test')}, this.test)
		}
	})
```
You would normally need to call `this.setState({test: 'newValue'})` and the test variable that holds some data would be within an object state: {test: ''} when you set it with the return value of `setInitialState()`. But in this case since the diffing is running all the time it doesn't need `this.setState` to trigger a render.