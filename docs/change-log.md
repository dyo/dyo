## 5.0.3 (December 30, 2016)

- patch `defaultProps` & `getDefaultProps`
- better intergrate hydration with SSR stylesheets
- use component name/function name/displayName for css namespaces when available
- patch for hoisted nodes when hydrating SSR
- patch for cloning fragments
- patch performance regression between v4 and v5

## 5.0.2 (December 27, 2016)

- patch nano

## 5.0.1 (December 27, 2016)

- perf improvements

## 5.0.0 (December 26, 2016)

- render now accepts a callback argument `.render(vnode, target, callback(root))`
- support string refs
- add shallow render `dio.shallow`
- render is now no-destructive to the mount node
- hydration is now configurable `.render(vnode, target, null, true)`
- hydration is the only breaking change, pre 5.0 used an attribute `hydrate`


## 4.0.1 (December 19, 2016)

- improvement in handling callbacks passed to `.forceUpdate`
- bump css compiler

## 4.0.0 (December 16, 2016)

- improve performance
- improve SSR
- introduce non-blocking async hydration
- introduce constructor to createClass, remove auto binding
- remove `autoBind` method from Components
- intergrate support for two-way data binding on events and binding data to a function
- support empty/null render
- support changing component root nodes
- remove all utilities except `stream`
- add router methods `pause`, `resume`, `set`, `resolve`, `destroy` and `location` getter/setter
- add support for `responseType` to `request`
- remove all helper methods from streams except `resolve` and `reject`
- improve css compiler
- introduce packages

## 3.4.1 (November 29, 2016)

- handle setting a style property to false i.e `style.color = state.id && "red"` to remove it
- improve stylesheet compiler.

## 3.4.0 (November 27, 2016)

- improve stylesheet compiler
- handle the removal of hoisted elements to avoid memory leaks
- add `.stylis` to expose internal css compiler

## 3.3.0 (November 26, 2016)

- at root support to `dio.stylesheet` for pushing to root `@root {...}`
- patch `dio.stylesheet` handling `{}` when used without `&` like `&{}`

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

#### API changes

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

- Improves performance in various ways
- Added fragment support, you can now return a fragment/array of elements in render

#### dio.PropTypes

- Added all the react land PropTypes

```javascript
[
	number, string, bool, array, object, func, element, node
	any, shape, instanceOf, oneOf, oneOfType, arrayOf, objectOf
]
```

#### dio.createStore

- Added middleware support. `dio.createStore(reducer(s), initalState, enhancer)`
- Added `version`, `isValidElement`, `cloneElement`, `renderToString`, `renderToStaticMarkup`
- Exposes internal utilities to `dio._` that are used to get out-the-box support for IE 8+

#### Top Level API

```javascript
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