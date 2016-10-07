## 2.0.0 (October 07, 2016)

- performance, performance, performance.

### API changes

- `dio.render` replaces `dio.createRender`
- `dio.createClass` replaces `dio.createComponent`
- `dio.renderToString` replaces `dio.createHTML`
- `dio.router` replaces `dio.createRouter`
- `dio.stream` replaces `dio.createStream`
- push back `createFactory` to support react-like single element factories
- removed `componentDidUnmount` lifecycle method not to be confused with `componentWillUnmount`
- pushed utilities to the `dio` namespace, removed `dio._` namespace
- utility `dio.splice` replaces `dio.toArray`
- added ``flatten`, `splice`, `slice` utilities
- added `nodeType` to compiled vnodes, `1` for `Element`, `3` for `TextNode`

## 1.2.3 (September 16, 2016)

- patch .createRender/.render caching

## 1.2.2 (September 15, 2016)

- added caching to .createRender/.render

```javascript
dio.render(Component, '.app')();
dio.render(Component, '.app')();
// on the above code the second example will avoid 
// creating a component and render instance a second time
// and will rather return a cache of the render instance
// except in the case that the mount is different
```

## 1.2.1 (September 15, 2016)

- Improve performance
- componentWillUpdate & componentDidUpdate now also fire when a parent component re-renders

## 1.2.0 (September 12, 2016)

- Improves performance in various ways.
- Added fragment support, you can now return a fragment/array of elements in render

### dio.PropTypes

- Added all the react land PropTypes

```javascript
[
	number, string, bool, array, object, func, element, node
	any, shape, instanceOf, oneOf, oneOfType, arrayOf, objectOf
]
```

### dio.createStore

- Added middleware support. `dio.createStore(reducer(s), initalState, enhancer)`

### API

- Added `version`, `isValidElement`, `cloneElement`, `renderToString`, `renderToStaticMarkup`
- Exposes internal utilities to `dio._` that are used to get out-the-box support for IE 8+

``` javascript
toArray
assign      (Object.assign)
keys        (Object.keys)
forEach     ([]/{}.forEach)
reduce      ([].reduce)
reduceRight ([].reduceRight)
filter      ([].filter)
map         ([].map)
isObject
isFunction
isString
isArray
isDefined
addEventListener
```