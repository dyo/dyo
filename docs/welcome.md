Dio is a lightweight (~6kb) Virtual DOM framework.

[Install v0.1.0](/documentation "button")

```
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