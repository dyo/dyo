dio is a fast javascript framework for building applications.

<p>[Install v5.1.0](./#installation "button")</p>

```javascript
class Main extends dio.Component {
	render ({value}) {
		return h('h1', value);
	}
}

dio.render(Main)({value: 'Hello World'});
```