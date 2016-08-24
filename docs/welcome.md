Dio is a fast and lightweight (~7kb) feature rich Virtual DOM framework.

[Install v1.1.0](./documentation "button")

```javascript
function main () {
	return {
		render: function (props) {
			return h('h1', props.value)
		}
	}
}

var
render = dio.createRender(main, "body");
render({value: "Hello World"})
```