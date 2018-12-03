## Unreleased

- Change package name "dio.js" to "dyo".
- Move repo to organization. [github.com/dyo/dyo](https://github.com/dyo/dyo)

### Added

- Added `getDerivedState`.

Replaces `componentWillMount`, `componentWillUpdate` and `componentWillReceiveProps`.

- Portal re-parenting.

When a portals container changes, previous children are moved to the new container instead of unmounted and re-created.

- Added support for a `timeout` prop on thenable elements: `h(Promise.resolve(1), {timeout: 1000}, "Taking Long?")`

- Default `render` methods.

Both `Component` and `PureComponent` classes implement a default render method that returns `props.children` when children is not a render prop(function) otherwise it invokes it with prop, state and context as arguments.

- The `PureComponent` class extends `shouldComponentUpdate` to also shallow compare context in addition to props and state.

- The `render` interface can now render into any container. For example it could noop render into a non-DOM container: `render('Hello', {})`.

- New `dyo/server` package, supports rendering to any writable streams For example – a node response object: `render('Hello', response)`, with friction-less async and error boundary support.

### Removed

- Removed `unmountComponentAtNode`.

Redundent given `render(null, target)` archives the same effect.

- Removed `findDOMNode`.

Undeterministic given exotic elements like Fragments don't have "single" DOM node. Refs are the better abstraction given they are also auto-fowarded.

- Removed `renderToStream` and `renderToString`.

Better level of abstraction with a single source of entry with: `render`. The `dyo/server` package accepts writable streams to write to.

- Removed `componentWillMount`, `componentWillUpdate` and `componentWillReceiveProps`. 

Added `getDerivedState` to replace them all. 

- Removed `createFactory`, `createComment`.
