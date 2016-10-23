Dio is a blazing fast, lightweight (~9kb) feature rich Virtual DOM framework.

[Install v2.1.1](./documentation "button")

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