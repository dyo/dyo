## 3.2.0 (November 25, 2016)

- improve performance of `dio.escape`
- add `dio.renderToStream`
- add `dio.renderToCache`
- patch `dio.flatten`

## 3.1.0 (November 22, 2016)

- improve performance of escaping SSR
- add `dio.escape`

## 3.0.6 (November 21, 2016)

- patch stylesheet to use valid html attribute for namespacing `scope` becomes `data-scope`
- escape props and textNodes for server-side rendering

## 3.0.5 (November 19, 2016)

- improve `stylesheet` parser, now more forgiving i.e trailing `;` is optional
- patch to `stylesheet` prefixer for transforms and appearance
- patch to `stylesheet` to handle minified css
- patch `dio.input` eof
- all round the stylesheet parser is now better at handling multiple input styles

## 3.0.4 (November 17, 2016)

- patch stylesheet to support loose formatting i.e `leaving out ; at end of declaration`

## 3.0.3 (November 17, 2016)

- patch `dio.input` end of file `.eof`

## 3.0.2 (November 17, 2016)

- patch stylesheet @media queries encapsulation
- add `.pos` to `dio.input` to retrieve current caret position
- add `dio.stream.resolve` to match promise spec
- add `dio.stream.reject` to match promise spec
- patch compatibiliy of `dio.stream` with ES6 async & await

## 3.0.1 (November 12, 2016)

- patch stylesheet encapsulation with pure functions

## 3.0.0 (November 11, 2016)

- add support for style encapsulation
- improve server side rendering
- move code baseto  modularity approach

### API changes

- added stylesheet component method
- removed injectWindowDependency()
- removed registerEnviroment()
- removed `Array`, `Object` and `Event` utilities
- added `input`, `panic`, `sandbox` and `random` utilities
- rename `curry` utility to `defer`
- rename `animateWith` to `animate`


## 2.1.2 (October 29, 2016)

- patch `dio.renderToString` className should map to class
- patch `dio.Children.only`
- improve compatibility with commonJS enviroments
- add `dio.unmountComponentAtNode` top level api, mirrors `React`
- add `dio.applyMiddleware`, `dio.combineReducers` and `dio.compose` to top level api

## 2.1.1 (October 23, 2016)

- add `dio.Children` top level api, mirrors `React`
- better intergration with webpack
- patch `dio.createElement` rename conflict
- patch `dio.createElement` assign children components
- patch assignment of component `this.props.children`
- patch issue with es6 Components class `.defaultProps` not registering
- pathc redux store initialState

## 2.1.0 (October 18, 2016)

- more performance tweaks to (SSR, hydration, mounting, patching)
- expose internal VNode creation helpers

### API changes

- added `dio.VText`
- added `dio.VElement`
- added `dio.VFragment`
- added `dio.VSvg`
- added `dio.VComponent`
- added `dio.VBlueprint`
- added `dio.DOM`, like React.DOM, but only initialized when called

## 2.0.1 (October 14, 2016)

- tweaks to allow more performance optimizations when needed
- add `dio.findDOMNode`

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