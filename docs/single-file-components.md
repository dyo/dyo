# Single File Components

Single file components are self contained components including within them their own stylesheets.

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
			'0%': ['background-color: blue'],
			'50%': ['background-color: black']
		}
	}
}

dio.createStyle(styles, namespace)();

function HelloWorld () {
	return {
		render: function (props) {
			return h('div', {id: this.displayName}
						h('h1', props.text)
					)
		}
	}
}

dio.createRender(HelloWorld, '.app')({text: 'Hello World'});
```
