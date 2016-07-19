# API Reference

## components schema

```javascript
{
	// lifecycle methods
	shouldComponentUpdate:     (props, state, this)
	componentWillReceiveProps: (props, state, this)
	componentWillUpdate:       (props, state, this)
	componentDidUpdate:        (props, state, this)
	componentWillMount:        (props, state, this)
	componentDidMount:         (props, state, this)
	componentWillUnmount:      (node)
	
	// this.methods
	this.withAttr              ({String|String[]}, {Function|Function[]})
	this.forceUpdate:          ({Object})
	this.setState:             ({Object})
	this.setProps:             ({Object})
}
```

## dio.createRender

## dio.createRender

## dio.createRouter

## dio.createStore

## dio.createHTML

## dio.exposeDOM

## dio.animate

## dio.request

## dio.stream

## dio.curry