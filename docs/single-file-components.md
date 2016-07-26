# Single File Components

Single file components are self contained components including within them their own css stylesheets.

```javascript
<div class="app"></div>
<script src="dio.min.js"></script>

<script>
	function HelloWorld () {
		var styles = {
			'h1': {
				'font-size': '40px',
				
				// takes the return value of the function
				width: function () {
					return window.innerWidth
				},
				
				// state
				':hover': {
					color: 'blue'
				},
				
				// pseudo element
				':after': {
					content: ' '
				}
			}
		}
		
		return {
			getInitialState: function () {
				return {styles: dio.createStyle(styles, '#'+this.displayName)};
			},
			render: function (props) {
				return h('div', {id: this.displayName}
							h('h1', props.text),
							this.state.styles
						)
			}
		}
	}
	
	dio.createRender(HelloWorld, '.app')({text: 'Hello World'})
</script>
```
