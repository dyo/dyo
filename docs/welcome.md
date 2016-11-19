Dio is a blazing fast, lightweight (~10kb) feature rich Virtual DOM framework.

[Install v3.0.5](./documentation "button")

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