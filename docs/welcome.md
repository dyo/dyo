dio is a fast javascript framework

<p>[Install v4.0.1](./#installation "button")</p>

```javascript
function Main () {
	return {
		render: function (props) {
			return h('h1', props.value)
		}
	}
}

dio.render(Main)({value: 'Hello World'})
```