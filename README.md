# DIO

[![dio.js](https://dio.js.org/assets/images/logo.svg)](https://dio.js.org)

A Library For Building User Interfaces.

- ~8kb

[![licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/thysultan/dio.js/blob/master/LICENSE.md)
[![npm](https://img.shields.io/npm/v/dio.js.svg?style=flat)](https://www.npmjs.com/package/dio.js)
[![Build Status](https://travis-ci.org/thysultan/dio.js.svg)](https://travis-ci.org/thysultan/dio.js)
[![Coverage Status](https://coveralls.io/repos/github/thysultan/dio.js/badge.svg)](https://coveralls.io/github/thysultan/dio.js)
![dependencies](https://img.shields.io/badge/dependencies-none-green.svg?style=flat)
[![Join the chat at https://gitter.im/thysultan/dio.js](https://img.shields.io/badge/chat-gitter-green.svg?style=flat)](https://gitter.im/thysultan/dio.js)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/thysultan/dio.js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/thysultan/dio.js/context:javascript)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/thysultan/dio.js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/thysultan/dio.js/alerts)

## Support

* Edge
* IE 9+
* Chrome
* Firefox
* Safari
* Node

---

## Installation

#### Direct Download

```html
<script src=dio.min.js></script>
```

#### CDN

```html
<script src=https://unpkg.com/dio.js></script>
<script src=https://cdn.jsdelivr.net/npm/dio.js></script>
```

#### NPM

```
npm install dio.js --save
```

---

## Getting started

```js
dio.render(
  h('h1', 'Hello, world!'),
  document.getElementById('root')
)
```

## Links

1. [Introduction](https://dio.js.org/introduction)
2. [API](https://dio.js.org/api)
3. [REPL](https://dio.js.org/repl)

## Features

The following is an overview of the features afforded.

1. ### Rendering

	1. Elements
	1. Components
	1. Primitives
	1. Fragments, Arrays, Iterables
	1. Comments, Portals, and Promises

1. ### Components

	1. Functional stateful components
	1. Class stateful components

1. ### Events

	1. Functions, [EventListener](https://developer.mozilla.org/en/docs/Web/API/EventListener) or an Array of either.

1. ### Errors

	1. Error boundaries marked by the `componentDidCatch` lifecycle.

1. ### setState

	1. Object
	1. Promise

1. ### Async Lifecycle

	1. async componentWillUnmount
	1. async getInitialState

## Example

The following overloaded example presents a few features detailed above, namely – error boundaries, an implicit setState return, Promise setState and rendering Promises & Fragments.

```js
class Input {
	// error boundary
	componentDidCatch (err, {componentStack, origin, message}) {
		return {error: true}
	}
	// isomorphic async getInitialState
	async getInitialState() {
		return {value: 'Hi!'}
	}
	// implicit promise setState
	async handleInput({target}, props, state) {
		return {value: target.value}
	}
	// rendering promises
	async render(props, {value, error}, context) {
		// error state
		if (error)
			return h('h1', 'Something went wrong!')

		// fragments
		return [
			h('input', {
				value: value,
				// bonus: events preserve "this" reference
				onInput: this.handleInput
			}),
			h('p', value)
		]
	}
}

dio.render(h(Input))
```

---

## Goals

Public react compatibility with an [edge](#edge), this should mean that most react libraries can work as long as they does not make use of undocumented/public features, for example API's prefixed with `unstable_` and vice-versa.

## Comparison, React

#### Custom Renderer, Factory

Affords the same ability as React to create your own renderer.

#### Portals, Event Bubbling

Events bubble in Portals as you would expect them to in the DOM, this avoids issues such as [#11387](https://github.com/facebook/react/issues/11387) where bubbling through the virtual tree has some unintended behaviors.

In addition  `createPortal` supports string selectors and server-side rendering portals, a feature that might also make it into react: [related issue](https://github.com/facebook/react/issues/10711).

#### Events, Delegation

In contrary to the assumed pros of event delegation a general purpose event delegation model is intentionally avoided to avoid the performance and memory pitfalls that come with re-implementing this at the level of abstraction that JavaScript affords, when considering the standard event bubbling behaviour that the host platform implements. That is to say, implementing such a system involves doing more work than the host platform would otherwise do.

#### Hydration, Self Correction

Hydration goes the [whole 9 yards](https://en.wikipedia.org/wiki/The_whole_nine_yards) to correct differences when hydrating, where React might otherwise error or ignore.

#### Error Messages

As opposed to React, the concept of developer warnings in a development build does not exist, The semantics that surround error boundaries help provide error messages when they occur at runtime.

## Tradeoffs

#### Community.

React has a big community.

#### Warnings

React has developer build warnings.

## Edge

#### Supporting Promises

The ability to render Promises makes support for code-splitting and lazy loading straight forward when supported at the library level. The ability to use a Promise for initial state makes data fetching more declarative and the ability to update state with a promise allows you to deal with async services without cutting back on the declarative nature that is afforded to other first-class citizens.

```js
class Input {
	async getInitialState() {
		return await fetch('service/')
	}
	async handleInput({target}, props, state) {
		return await fetch('service/?value=${target.value}')
	}
	async render() {
		return h('input', {
			value: value,
			onInput: this.handleInput
		})
	}
}
```

#### Supporting Delayed Unmount

It is no surprise that declarative entry and exit animations in React are not at its best compared to other first-class citizens.

Allowing a means to declaratively define a delayed unmount that can enqueue  exit animations before an unmount goes a long away in reducing the abstractions that go into dealing with this in its absence.

```js
class Input {
	async componentWillUnmount(node){
		return new Promise((resolve) => {
			node.animate([...], {...}).onfinish = resolve
		})
	}
	async getInitialState() {
		return {value: 'Initial value!'}
	}
	async handleInput({target}, props, state) {
		return {value: target.value}
	}
	async render() {
		return h('input', {
			ref: 'input'
			value: value,
			onInput: this.handleInput
		})
	}
}
```

#### Event "this"

React events outside of `createClass` components have an infamous relationship with `.bind`. The implementation details allow us to avoid this relationship and additionally allow multiple event handlers for a single event.

```js
class Input {
	handleSubmit(e, props, state) {
		this instanceof Input
	}
	handleReset(e, props, state) {
		this instanceof Input
	}
	render() {
		return h('form', {
			onSubmit: [this.handleSubmit, this.handleReset]
		})
	}
}
```

##### Async Generators

Support for async iterators works much like regular iterators, but instead of a sequence of elements involve a sequence of states. This allows synchronous designs to emerge from otherwise asynchronous programs.

```js
class Suspense {
	async *render() {
		yield 'Loading...'
		const data = await fetch('./')
		yield h('pre', JSON.stringify(data))
	}
}
```

#### Server Side Renderer

Rendering promises/awaiting promise states is afforded to components within the context of `renderToNodeStream` allowing both the previous example uses of `async getInitialState` and Async Generators to render just as well when delivering a rendered payload from a server.

#### Custom Components

Custom components are components that instantiate their own host elements. Within a DOM context a custom element constructor might fall under this group of components.

```js
class WordCount extends HTMLElement {
	// ...
}
customElements.define('word-count', WordCount)
```

This allows us to render the given `WordCount` custom element without afore knowledge of its defined `localName`.

```js
render(h(WordCount))
```
