dio is a fast javascript framework

<p>[Install v4.0.0](./#installation "button")</p>

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