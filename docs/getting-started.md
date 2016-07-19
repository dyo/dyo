# Getting Started

Dio is a lightweight (~6kb) Virtual DOM framework 
built around the concept that any function/object can be a component.

Components in Dio share the same api's as react components with a few additions.
This getting started guide will show you how to go from zero to hello world.


## Hello world

```javascript
<div class="app"></div>

<script src="dio.min.js"></script>
<script>
	function HelloWorld () {
		return {
			render: function (props) {
				return h('h1', props.text);
				// or
				return {type: 'h1', props: {}, children: [props.text]};
			}
		}
	}
	
	dio.createRender(HelloWorld, '.app')({text: 'Hello World'})
</script>
```

Will mount a h1 element onto the .app div the contents of which will be 'Hello World'.