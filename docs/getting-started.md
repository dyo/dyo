# Getting Started

Dio is a lightweight (~6kb) Virtual DOM framework 
built around the concept that any function/object can be a component.

Components in Dio share the same api's as react components with a few additions.
This getting started guide will show you how to go from zero to hello world.


## Hello world

```javascript
function HelloWorld () {
	return {
		render: function (props) {
			return h('h1', props.text);
			// or
			// return {type: 'h1', props: {}, children: [props.text]};
		}
	}
}

dio.createRender(HelloWorld)({text: 'Hello World'})
```

Will mount a h1 element onto the page contents of which will be 'Hello World'.