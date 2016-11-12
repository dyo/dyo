# Getting Started

Dio is a blazing fast, lightweight (~10kb) feature rich Virtual DOM framework
built around the concept that any function/object can become a component.

Components in Dio share the same api's as react with a few additions, 
this means that you can easily port both ways between Dio and React as and when needed
without any significant changes to the code base, 
the minimal change in most cases being a simple `React, ReactDOM = dio`.

Having said that Dio can be used as just a "view" library but it does come
self containeed with everything you would need to build an application,
from routing, http requests, server-side rendering to testing, state stores, animations and more.

In that respect this getting started guide aims to show you how to go from zero to hello world in Dio.


## Hello world

```javascript
function HelloWorld () {
	return {
		render: function (props) {
			return h('h1', props.text)
		}
	}
}

dio.render(HelloWorld)({text: 'Hello World'})
```

Will mount a h1 element onto the page the contents of which will be 'Hello World'.