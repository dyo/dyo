dio is a javascript framework for building applications.

<p>[Install v6.1.1](./#installation "button")</p>

```javascript
class Main extends dio.Component {
	async render ({value}) {
		return h('h1', value);
	}
}

dio.render(Main)({value: 'Hello World'});
```

