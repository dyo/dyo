Dio is a fast and lightweight (~9kb) feature rich Virtual DOM framework.

[Install v1.2.2](./documentation "button")

```javascript
function main () {
	return {
		render: function (props) {
			return h('h1', props.value)
		}
	}
}

dio.createRender(main, "body")({value: "Hello World"});
```