# Getting Started

Dio is a lightweight (~6kb) Virtual DOM framework. This getting started guide will cover the following
in order.

- hello world
- animations (flip & transition)
- requests
- router
- stores
- streams
- server-side rendering
- lifecycles

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
var render = dio.render(TodoApp, '.app')

// call it when you want to render to the dom
render(...props?, children?, forceUpdate?)
```

