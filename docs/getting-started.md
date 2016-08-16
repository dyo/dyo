# Getting Started

Dio is a lightweight (~7kb) full feature Virtual DOM framework
built around the concept that any function/object can become a component.

Components in Dio share the same api's as react with a few additions, 
this means that you can easily port both ways between Dio and React as and when needed
without any significant changes to the code base, 
the minimal change in most cases being a simple `React, ReactDOM = dio`.

Having said that dio can be used as just a "view" library but it does come
self containeed with everything you would need to build an application.

In that respect this getting started guide aims to show you how to go from zero to hello world in Dio.


## Hello world

```javascript
function HelloWorld () {
	return {
		render: function (props) {
			return h('h1', props.text);
		}
	}
}

dio.createRender(HelloWorld)({text: 'Hello World'})
```

Will mount a h1 element onto the page contents of which will be 'Hello World'.