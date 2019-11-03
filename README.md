# Dyo

[![Dyo](https://dyo.js.org/assets/images/logo.svg)](https://dyo.js.org)

A JavaScript library for building user interfaces.

[![Build](https://travis-ci.com/dyo/dyo.svg?branch=master)](https://travis-ci.com/dyo/dyo)
[![Coverage](https://coveralls.io/repos/github/dyo/dyo/badge.svg?branch=master)](https://coveralls.io/github/dyo/dyo)
[![Size](https://badgen.net/bundlephobia/minzip/dyo)](https://bundlephobia.com/result?p=dyo)
[![Licence](https://badgen.net/badge/license/MIT/blue)](https://github.com/dyo/dyo/blob/master/LICENSE.md)
[![NPM](https://badgen.net/npm/v/dyo)](https://www.npmjs.com/package/dyo)

## Installation

* Use a Direct Download: `<script src=dyo.js></script>`.
* Use a CDN: `<script src=unpkg.com/dyo></script>`.
* Use NPM: `npm install dyo --save`

## Documentation

Documentation can be find [on the website](https://dyo.js.org).

See the [Getting Started](https://dyo.js.org/introduction.html) page for a quick overview.

The documentation is divided into several sections:

* [Introduction](https://dyo.js.org/introduction.html)
* [API Reference](https://dyo.js.org/api.html)
* [Advanced Guides](https://dyo.js.org/advanced.html)
* [Examples](https://dyo.js.org/examples.html)

You can improve it by sending pull requests to [this repository](https://github.com/dyo/dyo/docs).

## Examples

Several examples can be found [on the website](https://dyo.js.org/examples.html). Here's one to get started:

```js
import {h, render} from 'dyo'

function Example (props) {
	return h('h1', {}, 'Hello ', props.name)
}

render(h(Example, {name: 'World'}), 'body')
```

This will render a heading element with the text content "Hello World" into the specified target(the body element).

## Comparison

The library is much alike React, so it's only natural that a comparison of the differences is in order; Which if successful might manage to highlight why it exists.

#### Re-parenting

The `Portal` component supports string selectors as targets. This presents an array of different possibilities with regards to isomorphic target references.

```js

function Example (props) {
	return h(Portal, {target: 'main'}, 'Hello')
}

render(h(Example), 'body')
```

In addition to this – re-parenting is baked into portals. That is when a portals container is changed, instead of unmounting its contents and re-mounting them to the newly designated container we can instead move its contents without replaying destruction unmount operations that may discard valuable interface and component state.

In co-ordination with custom renderers, portals afford the opportunity to create atomic branch specific custom renderers. Imagine isolated declarative canvas renderers within a document renderer.

#### Promises

Promises(or thenables) are first class values. This affords authors the ability to render promises, directly await promises within effects and events, and delay unmounting.

```js
render(h(Promise.resolve('Hello'), {}, 'Loading...'))

function Example (props) {
	useEffect(async () => {
		// out of band updates in here
		// are also batched
		return async () => {
			// delays unmount until the animation
			// has completed
			return props.current.animate({}).finished
		}
	})
}
```

#### Callbacks

In an async world, public interfaces like `render` are not guaranteed to complete synchronously if a subtree happens to have async dependencies within it. A consequence of this will see more use cases for the optional `callback` arguments that this function accepts – in much the same way authors are afforded the ability to await on this central routine.

```js
await render(h(Promise.resolve('Hello')))

console.log('Done')
```

##### Async Generators

In addition to the iterator protocol, supports for the async iterator protocol is baked in – every iteration is a step in the sequence of state transitions, modeled to afford authors the primitive to implement pseudo-synchronous designs from otherwise asynchronous application interfaces.

The following would first render `Loading...` fetch the resource `./` then render the stringified response.

```js
async function* Example (props) {
	yield 'Loading...'
	const data = await fetch('./')
	yield h('pre', JSON.stringify(data))
}
```

##### Resources

In addition to other [hooks](https://dyo.js.org/hooks.html), a resource allocation hook that can be used to fetch and cache resources.

```js
function Example (props) {
	const resource = useResource(props => fetch('https://reqres.in/api/users'))
	return h('pre', {}, JSON.stringify(resource))
}
```

##### Async Server Rendering

Server side rendering supports the plethora of async primitives supported.

```js
import {h, useResource} from 'dyo'

function Example (props) {
	const resource = useResource(props => fetch('https://reqres.in/api/users'))
	
	return h('pre', {}, JSON.stringify(resource))
}

import {http} from 'http'
import {render} from 'dyo/server'

http.createServer((request, response) => {
	return render(h('html', {}, h(Example)), response)
}).listen(8080)
```

### License

Dyo is [MIT licensed](./LICENSE).
