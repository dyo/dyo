## 1.2.2 (September 15, 2016)

- added caching to .createRender

```javascript
dio.createRender(Component, '.app')();
dio.createRender(Component, '.app')();
// the second one will not try to create 
// a component out of Component or a render instance
// but will rather return a cache of the 
// first created render instance
// except if the mount is different
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

- Added `version, isValidElement, cloneElement, renderToString, renderToStaticMarkup`
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