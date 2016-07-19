# Getting Started

Dio is a lightweight (~6kb) Virtual DOM framework. This getting started guide will cover the following
in order.

- hello world
- components schema

## Hello World

```javascript
// a function that returns a object with render
function TodoApp () {
	return {
		render: function (props, state, component) {
			return h('h1', 'Hello World')
		}
	}
}
// or a plain object
var TodoApp = {
	render: function (props, state, component) {
		return h('h1', 'Hello World')
	}
}

// create a render instance
var 
render = dio.createRender(TodoApp, '.app')

// call it when you want to render to the dom
render(...props?, children?, forceUpdate?)

// alternatively you can just call it when you create it
var
render = dio.createRender(TodoApp, '.app')()
```

## components schema

```javascript
{
	// lifecycle methods
	shouldComponentUpdate:     (nextProps, nextState, this)
	componentWillReceiveProps: (nextProps, null, this)
	componentWillUpdate:       (nextProps, nextState, this)
	componentDidUpdate:        (prevProps, prevState, this)
	componentWillMount:        (node, null, this)
	componentDidMount:         (node, null, this)
	componentWillUnmount:      (node, null, this)
	
	// this.methods
	withAttr                   ({String|String[]}, {Function|Function[]})
	// where the string is the elements attribute and
	// the Function is a setter to map to
	// this can be in-reverse as well i.e
	// mapping getters to element attributes
	
	forceUpdate:               ()
	setState:                  ({Object}) 
	// setState executes forceUpdate after updating the state
	setProps:                  ({Object})
}
```

