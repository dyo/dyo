dio is a fast javascript framework for building applications.

<p>[Install v5.0.0](./#installation "button")</p>

```javascript
const Main = dio.createClass({
	render (props) {
		return h('h1', props.value);
	}
});

// or
class Main extends dio.Component {
	render (props) {
		return h('h1', props.value);
	}
}

// or
const Main = h => props => h('h1', props.value);

dio.render(Main)({value: 'Hello World'});
```