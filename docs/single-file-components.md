# Single File Components

Single file components are self contained components with their own stylesheets,
this is possible with the use of `dio.createStyle` allowing us to create a component
within one file or function that has no external dependencies.

```javascript
var namespace = '#id';
var styles = {
	'h1': {
		'font-size': '40px',
		
		// takes the return value of the function
		width: function () {
			return window.innerWidth
		},
		
		// state
		'&:hover': {
			color: 'blue'
		},
		
		// pseudo element
		'&:after': {
			content: ' '
		},

		'@keyframes blink': {
			0: {
				backgroundColor: 'blue'
			},
			50: {
				backgroundColor: 'black'
			}
			// values can also be written as arrays
			// 0: ['background-color: blue;'],
			// 50: ['background-color: black;']
		}
	}
}

dio.createStyle(styles, namespace);

function HelloWorld () {
	return {
		render: function (props) {
			return h('div'+namespace,
						h('h1', props.text)
					)
		}
	}
}

dio.render(HelloWorld, '.app')({text: 'Hello World'});
```

You can also play with this [on JS Bin](http://jsbin.com/yayuxox/edit?js,output)
