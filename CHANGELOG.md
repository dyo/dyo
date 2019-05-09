## 1.0.0 (Unreleased)

- Change package name "dio.js" to "dyo".
- Move repo to organization. [github.com/dyo/dyo](https://github.com/dyo/dyo)

### Added

- `Suspense` and `Boundary` components.

- `memo` and `lazy` factories.

- Added hooks(state, effects, context, ref and memo/callback hooks).

- Portal re-parenting.

When a portals container changes, previous children are moved to the new container instead of unmounted and re-created.

- The `render` interface can now render into any container. For example it could noop render into a non-document container: `render('Hello', {})`.

- New `dyo/server` package, supports rendering to any writable streams For example – a node response object: `render('Hello', response)`, with friction-less async and error boundary support.

### Removed

- Removed `unmountComponentAtNode`.

Redundent given `render(null, target)` archives the same effect.

- Removed `findDOMNode`.

Undeterministic given exotic elements like Fragments don't have "single" DOM node. Refs are the better abstraction given they are also auto-fowarded.

- Removed `renderToStream` and `renderToString`.

Better level of abstraction with a single source of entry with: `render`. The `dyo/server` package accepts writable streams to write to.

- Removed `componentWillMount`, `componentWillUpdate` and `componentWillReceiveProps`.

Added effects `useEffect` and `useLayout` to replace them all.

- Removed `createFactory`, `createComment`.

- Remove `Component`, `PureComponent` and class components in general.

## 9.1.1 (19 July 2018)

- Patch [#68](https://github.com/thysultan/dio.js/issues/68)
- Patch [#69](https://github.com/thysultan/dio.js/issues/69)

## 9.1.0 (12 June 2018)

- Patch [#65](https://github.com/thysultan/dio.js/issues/65)
- New: `forwardRef` top-level API.
- New: `createRef` top-level API.
- Improvements to Error Boundary implementation.
- Improvements to `createElement` implementation.

## 9.0.4 (19 April 2018)

- Patch [#60](https://github.com/thysultan/dio.js/issues/60)
- Patch [#61](https://github.com/thysultan/dio.js/issues/61)

## 9.0.3 (11 April 2018)

- Patch [#59](https://github.com/thysultan/dio.js/issues/59)

## 9.0.2 (11 April 2018)

- Patch `select` element preventing default browser option selection behavior.

## 9.0.1 (11 April 2018)

- Patch `shouldComponentUpdate` preventing state update.

## 9.0.0 (11 April 2018)

#### Core

- Breaking: Improve Error Boundaries to behave more inline with React and `try..catch` heuristics.
- Improve: `async getInitialState` implementation.
- Improve: support for `defaultValue` on select elements.
- New: `createClass` top-level API.
- New: `createContext` top-level API.
- New: `createComment` top-level API.
- New: support async generators/iterators.
- New: support auto resolution of json `fetch` based Promises passed to setState/getInitialState.
- New: support custom element constructors.
- New: support multiple event handlers on a single event.

#### Reconciler

- Breaking: Name change to custom reconcilers method `getProps` to `getInitialProps`.
- Breaking: Name change to custom reconcilers method `setContent` to `setDocument`.
- NEW: `getUpdatedProps` reconciler API.
- NEW: `getContext` reconciler API.
- NEW: `createComment` reconciler API.
- NEW: `setComment` reconciler API.
- NEW: `willUnmount` reconciler API.

## 8.2.4 (11 March 2018)

- Patch nested rendering with children array.

## 8.2.3 (25 January 2018)

- patch children props sementics when coupled with both children props and children elements to behave like React and prefer children elements instead of the accumulation of both.

## 8.2.2 (19 January 2018)

- patch async setState in `componentWillMount` lifecycle to work on server-side renderer.

## 8.2.1 (18 January 2018)

- patch order of calling component ref when unmounting.
- patch server side rendering, call to `componentWillMount` lifecycle.

## 8.2.0 (04 December 2017)

- Produce an ESM module bundle.
- Improve reconciler.

## 8.1.1 (21 November 2017)

- Improvements to treatment of static cached/hoisted children.

## 8.1.0 (19 November 2017)

- Adds top-level API `createFactory` to create element or renderer factories.
- Adds `Children.find` and `Children.filter` to the top-level `Children` API.
- Adds support for cross-realm element construction/consumption.
- Improvements to the reconciler.
- Improves importing async components with `import(...)`.
- Fix [#39](https://github.com/thysultan/dio.js/issues/39) hydration of differing text node length.
- Fix [#40](https://github.com/thysultan/dio.js/issues/40) improves handling static hoisted elements.

#### createFactory

The `createFactory` API can be used to create element factories and additionally provides an interface to create client renderers that can target different platforms/targets.

#### Children.find

The `Children.find` API works like the `Array.find` API in that it allows you find a single element from the opaque children data-structure.

#### Children.filter

The `Children.filter` API works like the `Array.filter` API in that it allows you filter elements from the opaque children data-structure.

#### Reconciler Improvements

The reconciler has gone through some improvments that aim to insure the shorterst path is taken to reach a reconciled state.

#### Import(...)

This release includes improvements to the way(syntax sugar) you can dynamically import components.

```js
// A.js
export default class {
	render() {}
}
```

```js
// Before
class {
	render() {
		return import('./A.js').then(A => A.default)
	}
}

// After
class {
	render() {
		return import('./A.js')
	}
}
```

## 8.0.3 (09 October 2017)

- patch error when used with brunch, fusebox and browserfy bundlers.

## 8.0.2 (08 October 2017)

- reflect `setState` calls from `componentWillReceiveProps` lifecycle to update state synchronously like React.

## 8.0.1 (06 October 2017)

- patch `dio.version` to reflect the right version.

## 8.0.0 (06 October 2017)

### Overview

- Support `componentDidCatch`.
- Support `stateful` functional components.
- Support rendering fragments.
- Support rendering [Iterables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators).
- Support [EventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventListener) interface.
- Support `context`, getChildContext.
- Support strings refs for functional components.
- Support an opaque data-structure for `props.children`
- Support mounting to top-level `html` element.
- Support out of order server side rendering with portals.
- Adds top-level API `createPortal`.
- Adds top-level API `findDOMNode`.
- Adds top-level API `hydrate`.
- Adds top-level API `Children`.
- Adds top-level API `unmountComponentAtNode`
- Adds invarient errors for `render` if target container is invalid.

### Breaking Changes.

- `componentDidThrow` is renamed to `componentDidCatch` and unmounts the DOM if an error state is left unhandled. However errors coming from event handlers are exluded from this behaviour.

- `props.children` is now an opaque data-structure, which might break your application if you relied on it always being of an `Array` type.

- Passing an invalid object to `#render` as the container to render to will throw an error. Falsey values are not considered invalid values, these will fallback to the `root` Node in a DOM tree. Truethy values that are not of or do not extend/mimic the native `Node` class of the platform would be considered invalid.

- Hydration now exists soley as an explicit API `hydrate`.

- Hydration will now always try to make sure the DOM matches the virtual elements generated on the client. This may result in removing nodes or adding DOM nodes. This only bears any meaning if the server and client renders do not match in which case the reconciler will always try to make the DOM match what you render on the client.


## 7.1.0 (24 July 2017)

- Allow lazy loading primitive to render while loading module.
- Improve Promise return types.

## 7.0.4 (21 June 2017)

- bypass `shouldComponentUpdate` when coming from `forceUpdate`.
- patch `Components` to not require passing props to `super()`.
- patch missing value in `DOM` attributes that use the primitve `true` value.

## 7.0.3 (02 June 2017)

- handle invalid values for `style` prop

## 7.0.2 (02 June 2017)

- patch compatibility with "Web Components" classes
- patch mounting portals
- patch clone element

## 7.0.1 (26 May 2017)

- patch compatibility with webpack

## 7.0.0 (25 May 2017)

- reduced api surface

Apart from that improvements where mostly internal facing, like improving async return types
lifecycles on functional components, new architecture to support pausing and resuming tree
updates and more.

### API

```js
// client side
{
	render,
	createElement,
	h,
	Component,
	version
}

// server side
{
	...,
	shallow
}
```

#### renderToString

renderToString is supplimented by `h(..).toString()` in a server enviroment which means we could just do this `${h(..)}`

#### renderToStream

renderToStream is supplimented by `dio.render` which also supports rendering to a writable stream
on the server like the Node.js `Response` object and `h(..).toStream()`, `dio.render` however also handles streaming json responses and will set the correct MIME type if one hasn't been set.

## 6.1.2 (February 08, 2017)

- patch pure function components
- include pure function components in error boundries

## 6.1.1 (February 06, 2017)

- improve reconciler
- improve internal component property naming to avoid possible user-land naming conflicts
- improve hydration

## 6.1.0 (January 26, 2017)

- add DOMNodes to return types
- returning a DOMNode from render auto creates a portal
- `h` and `createElement` now support DOM(portal), array(fragment), element(clone), null/void(empty) as the type param
- add first class support for portals
- patch short hand class construction `cons Foo = h => (props, state) => h('h1', state.name)`
- exposes internal css compiler `dio.stylesheet`
- You can now register middleware/plugins for the css compiler `dio.stylesheet.use()`
- improve error boundary logs

## 6.0.2 (January 24, 2017)

- patch for string `style` props
- use faster timers where available to schedule an async task

## 6.0.1 (January 22, 2017)

- patch error boundaries to support `stylesheet`
- patch error boundaries to support error boundry handler `componentDidThrow`
- patch stylesheet, prevents adding styles to components that return components that return text nodes
- patch stylesheet, support adding namespacing to components that return components recursively

## 6.0.0 (January 22, 2017)

- adds async component support for `getInitialProps` on the server and client
- adds render types, render supports `coroutine/element/number/string/function/component/array/promise`
- adds error boundaries to components for non-breaking graceful error state handling
- improves keyed algorithm

## 5.1.0 (January 10, 2017)

- add support for passive event listeners `{onClick: {handler: () => {}, options: {passive: true}}}`
- add style support for css variables `style: {'--color': 'red',color: 'var(--color)'}`
- add typescript definitions

## 5.0.5 (January 07, 2017)

- patch minfied bundle

## 5.0.4 (January 06, 2017)

- patch http to trigger catch handler if status is fasley or `>= 400`
- patch http to allow `dio.request({string})` to alias `dio.request.get({string})`
- update the css compiler

## 5.0.3 (December 31, 2016)

- patch `defaultProps` & `getDefaultProps`
- better intergrate hydration with SSR stylesheets
- use component name/function name/displayName for css namespaces when available
- patch for hoisted nodes when hydrating SSR content
- patch for cloning fragments when hoisted
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
