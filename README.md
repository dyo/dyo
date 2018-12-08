# Dyo

[![Dyo](https://dyo.js.org/assets/images/logo.svg)](https://dyo.js.org)

Dyo is a JavaScript library for building user interfaces.

[![Build](https://travis-ci.com/dyo/dyo.svg?branch=master)](https://travis-ci.com/dyo/dyo)
[![Coverage](https://coveralls.io/repos/github/dyo/dyo/badge.svg?branch=master)](https://coveralls.io/github/dyo/dyo)
[![Size](https://badgen.net/bundlephobia/minzip/dyo)](https://bundlephobia.com/result?p=dyo)
[![Licence](https://badgen.net/badge/license/MIT/blue)](https://github.com/dyo/dyo/blob/master/LICENSE.md)
[![NPM](https://badgen.net/npm/v/dyo)](https://www.npmjs.com/package/dyo)

* **Light — weight** library with a small API surface that allows you to build simple and complex component based user interfaces.
* **Declarative** Efficiently render just the right components in response to data, making your code more predictable and easier to reason about.

[Learn how to use Dyo in your own project](https://dyo.js.org/introduction.html).

## Installation

* Use a Direct Download: `<script type=module src=dyo.js></script>`.
* Use a CDN: `<script src=unpkg.com/dyo></script>`.
* Use NPM: `npm install dyo --save`

## Documentation

You can find the Dyo documentation [on the website](https://dyo.js.org).

Check out the [Getting Started](https://dyo.js.org/introduction.html) page for a quick overview.

The documentation is divided into several sections:

* [Introduction](https://dyo.js.org/introduction.html)
* [Advanced Guides](https://dyo.js.org/advanced.html)
* [API Reference](https://dyo.js.org/api.html)
* [Examples](https://dyo.js.org/examples.html)

You can improve it by sending pull requests to [this repository](https://github.com/dyo/dyo/docs).

## Examples

You can find several examples [on the website](https://dyo.js.org). Here is the first one to get you started:

```js
import {h, render, Component} from 'unpkg.com/dyo'

class Hello extends Component {
  render(props) {
  	return h('div', 'Hello ', props.name)
  }
}

render(h(Hello, {name: 'World'}), 'main')
```

This example will render "Hello World" into the specified container on the page.

## Features

The following is an overview of the features that Dyo affords.

1. **rendering** (Components, Fragments, Portals, Promises)
1. **components** (Classes, Functions, Generators, AsyncGenerators)
1. **events** (Functions, Iterables, [EventListener](https://developer.mozilla.org/en/docs/Web/API/EventListener))
1. **setState** (explicit, implicit, awaitable)
1. **errors** (componentDidCatch)
1. **async** (componentWillUnmount)
1. **custom renderers** and more.

## Comparison

Dyo is much alike React, so it's only natural that a comparison of the differences is in order; Which if succesfull might manage to highlight why it exists.

#### Interfaces

Dyo affords authors the ability to create custom renderer, the interface around this is implicit in contrast to React.

#### Re-parenting

The `createPortal` interface supports string selectors and accepts props as an additional optional argument. This presents an array of different possibilities around container references and property mutations that you can propagate to portal containers.

In addition to this – support for re-parenting is backed into portals. That is when a portals container is changed, instead of unmounting its contents and re-mounting them to the newly designated container we can instead move its contents without replaying destruction unmount operations that may discard valuable state.

In coordination with custom renderers, portals afford the opportunity to create atomic branch specific custom renderers. Imagine isolated declarative canvas renderers within a tree.

#### Promises

Dyo treats promises(thenables) as first class values. This affords authors the ability to render promises, update state with promises, and delay unmounting with promises.

```js
render(h(Promise.resolve('Hello'), {timeout: 500}, 'Loading...'))

class Hello extends Component {
	async handleEvent() {
		return {name: 'World'}
	}
}

class Hello extends Component {
	async componentWillUnmount() {
		return this.refs.heading.animate([...], {...}).finished
	}
}
```

#### Callbacks

In an async world, public interfaces like `render`, `setState` and `forceUpdate` are not guaranteed to run to completion synchronously if a subtree happens to have async dependencies within it. A consequence of this will see more use cases for the optional `callback` arguments that these functions normally accept. Adding to this authors are afforded the ability to await on these common routines.

```js
await render(h(Promise.resolve('Hello')))

class extends Component {
	async componentDidMount() {
		await this.setState({...})
	}
}

class extends Component {
	async componentDidMount() {
		await this.forceUpdate()
	}
}
```

#### Events

Dyo affords authors the the ability to author events with an array of multiple event handlers and a chance to avoid the sometimes daunting relationship with the "this" keyword.

```js
class Hello extends Component {
	handleSubmit(e, props, state, context) {
		assert(this instanceof Hello)
	}
	handleReset(e, props, state, context) {
		assert(this instanceof Hello)
	}
	render(props, state, context) {
		return h('form', {onSubmit: [this.handleSubmit, this.handleReset]})
	}
}
```

#### Boundaries

In contrast to React error boundaries do not implicitly unmount the affected tree or print default error messages when an error is **caught**.

Error boundaries act much like the try..catch control-flow sementics present in the language, safely giving authors the ability to create richer primitives around the some-what niche control-flow mechanism that a throw..catch routine might afford.

#### PureComponent

In contrast to React `PureComponent` shallow compares `context` in addition to `props` and `state`.

#### Component

In contrast to React components that extend either `Component` or `PureComponent` have an implicit `render` method that render `props.children`. This affords authors a chance to ommit the implemention of the `render` method altogether when returning ` props.children` is the intended sementic.

##### Async Generators

In addition to the iterator protocol, Dyo also supports the async iterator protocol, where every iteration is a step in the sequence of state transitions updates, modeled to afford authors the primitive to implement psuedo-synchronous designs from otherwise asynchronous application interfaces.

```js
class Generator extends Component {
	async *render() {
		yield 'Loading...'
		const data = await fetch('./')
		yield h('pre', JSON.stringify(data))
	}
}
```

### License

Dyo is [MIT licensed](./LICENSE).
