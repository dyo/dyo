# DIO

[![dio.js](https://dio.js.org/assets/images/logo.svg)](https://dio.js.org/)

A Library For Building User Interfaces.

- ~8kb

[![licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/thysultan/dio.js/blob/master/LICENSE.md)
[![npm](https://img.shields.io/npm/v/dio.js.svg?style=flat)](https://www.npmjs.com/package/dio.js)
[![Build Status](https://travis-ci.org/thysultan/dio.js.svg)](https://travis-ci.org/thysultan/dio.js)
[![Coverage Status](https://coveralls.io/repos/github/thysultan/dio.js/badge.svg)](https://coveralls.io/github/thysultan/dio.js)
![dependencies](https://img.shields.io/badge/dependencies-none-green.svg?style=flat)
[![Join the chat at https://gitter.im/thysultan/dio.js](https://img.shields.io/badge/chat-gitter-green.svg?style=flat)](https://gitter.im/thysultan/dio.js)

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

The easiest way to get started with DIO is to walk through the [Introduction to DIO](https://dio.js.org/introduction) or the [API Documentation](https://dio.js.org/api).

## Features

The following is an overview of the features DIO allows you to make use of.

1. ### Rendering

	1. Elements
	1. Components
	1. Primitives like strings, numbers, null, undefined
	1. Fragments like Arrays, Iterables
	1. and others renderables like Promises and Portals

1. ### Components

	1. Functional stateful components
	1. Class stateful components

1. ### Events

	1. Functions or [EventListener](https://developer.mozilla.org/en/docs/Web/API/EventListener)
	1. Preserve "this" reference

1. ### Errors

	1. Error boundaries through `componentDidCatch`

1. ### setState

	1. As with a Object
	1. As with a Promise
	1. As with an implicit return

1. ### Lifecycle

	1. async componentWillUnmount
	1. async getInitialState

## Example

This intentionally overloaded example presents a few features detailed above, namely – error boundaries, an implicit setState return, Promise setState and rendering Promises & Fragments.

```js
class Input {
	// Error Boundary
	componentDidCatch ({stack, message, ...error}, {componentStack}) {
		return {error: true}
	}
	// Isomorphic Async getInitialState
	async getInitialState() {
		return {value: 'Hi!'}
	}
	// Implicit Promise setState
	async handleInput({target}, props, state) {
		return {value: target.value}
	}
	// Rendering Promises
	async render(props, {value, error}, context) {
		if (error)
			return h('h1', 'Something went wrong!')

		// Rendering Fragments
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

## Links

1. [Introduction to DIO](https://dio.js.org/introduction)
2. [API Documentation](https://dio.js.org/api)
3. [REPL](https://dio.js.org/repl)

--


## Goals

Public react compatibility with an [edge](#edge), this means that any react library should work as long as it does not make use of undocumented/public features for example API's prefixed with `unstable_`.

## Differences

#### Custom Renderer, Factory

There are a few react-like libraries but at the date of this writing DIO might be the only one to afford the ability to create your own renderer. Now while both React and DIO expose a way to create your own renderer, there is a difference in how you create this custom renderer.

While react might exposes a package called `react-reconciler` DIO exposes a public API for this as part of an overloaded `createFactory` API.

This is coupled with fact that the config structure somewhat differ as do the arguments passed to the methodes implemented – for example react might pass the view instance(in the case of ReactDOM this might be a DOM node) to the method while DIO would pass the related virtual element(s) that have a reference to the DOM node, which you can then extract(by means of a readonly property), which can be argued gives renderers room to do more with what they have.

All in all it is easy for DIO to consume the react reconcilers config, so the plan is that once the `react-reconciler` package is considererd stable by the React team DIO is in a position to consume the sementics of its config.

As a show of confidence DIO itself uses this interface to implement the DOM renderer that it ships by default, which can be used to create any renderer.

#### Portals, Event Bubbling

Events bubble in Portals as you would expect them to in the DOM, this avoid issues like [#11387](https://github.com/facebook/react/issues/11387) where bubbling them through the virtual tree has unintented behaviors.

The `createPortal` API also supports string selectors which allows for server-side rendering portals and out-of-order rendering, a feature that might also make it into react: [related issue](https://github.com/facebook/react/issues/10711).

#### Events, Delegation

Though it may sound strange when considering all the articles about event delegation and performance/memory DIO on the other hand intentionally does not implement events with delegation to avoid the performance impact that comes with re-implementing(in JavaScript) event bubbling that browsers do, which is almost always efficiently handled by the host enviroment.

However DIO's model does not create any more memory when attaching events than you might imagine React's event delegation model to use, interestingly it might just create less considerering that where react might create a Map entry for each element-event-pair the browser is in a better position to use an optimial reference pointer and data-strucuture to track the relationship between event handlers and elements when using addEventListener for each element.

In simple terms implementing events with Reacts model of delegation(preserving the DOM model of bubbling) involves doing the same/more amount of work at assignment of the event and more work when emitting the events than a browser would otherwise do.

#### Hydration, Self Correcting

DIO goes the [whole 9 yards](https://en.wikipedia.org/wiki/The_whole_nine_yards) to correct differences when hydrating where react might otherwise error or ignore.

#### Error Messages

There are error messages for incorrect use of top-level API's but react is famous for going the extra mile in both error messages and warnings regarding what is considered best practices in **dev mode** but the presence of error boundaries insures that if an error does occur DIO can give you a full trace of the component tree affected in a presentable error message and more.

## Tradeoffs

#### Community.

React hands down has the bigger community.

#### Warnings

React has dev mode warnings where DIO does not.

#### unstable_API

Sadly some libraries do make use of these undocumented unstable API's that React sometimes exposes with a `unstable_` prefix – which DIO intentionally ignores implementing due to their otherwise "considered" unstable nature.

## Edge

There a lot of small details that give DIO its edge that don't realy touch on new API's but rather on creating a larger surface area of what React already supports and adding to this.

For example React can render strings, numbers, elements and components but what if it was able to render Promises or Thenables? This would help solve a lot of "problems" with data fetching and lazy loading that is possible with React but not declaratively incentivised at the library level.

#### Supporting Thenables/Promises

The ability to render thenables makes support for code-splitting and lazy loading easy at the library level. The ability to use a Promise for initial state makes data fetching more declartive at the library level and the ability to update state with a promise allows you to deal with async services without cutting back on the declarative nature that is afforded to first-class citizens like elements.

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

#### Supporting Pending Unmounts

It's no suprise that declarative entry and outro animations in react are not at its best compared to other first-class citizens.
Allowing a means to declaratively define a pending unmount that can trigger an outro animation before it is unmounted goes a long away in reducing the abstractions that go into dealing with this when this feature is abscent from the library level.

```js
class Input {
	async componentWillUnmount(){
		return new Promise((resolve) => {
			findDOMNode(this).animate([...], {
				...
			}).onfinish = resolve
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
			value: value,
			onInput: this.handleInput
		})
	}
}
```

#### Events & "This"

Events in React have the infamous legacy of `.bind`. The implementation details of DIO allow it to avoid this legacy as demonstrated in the examples mentioned. In addition DIO allows for multiple event handlers on a single event as illustrated in the following example.

```js
class Input {
	handleSubmit(e, props, state) {
		// ...
	}
	handleReset(e, props, state) {
		// ...
	}
	render() {
		return h('form', {
			onSubmit: [this.handleSubmit, this.handleReset]
		})
	}
}
```

##### Async Generators

```js
class Suspense {
	async *render() {
		yield 'Loading...'
		yield h('h1', 'Complete!')
	}
}
```

#### Server Side Renderer

While React 16 does allow some level of async server side rendering with `renderToNodeStream` DIO takes it a step further to make sure that the mentioned points about rendering Promises and Promise states applies just as well in a server side render.

That is to say the server-side renderer can render whatever the client renderer can, including portals – which coupled with the client renderers hydration API allows for out of order rendering that is ordered on the client while hydrating.

#### Custom Components

Custom components are components that instantiate their own host elements. A custom elements constructor might fall under this group of components.


```js
class WordCount extends HTMLElement {
	// ...
}
customElements.define('word-count', WordCount)
```

Given DIO's goal to support custom renderers that might not even target the DOM the definition of a what is a custom component is left up to the renderer to configure. In the case of the default DOM renderer this would match custom elements/web components allowing us to render the `WordCount` custom element given without knowing its `localName`.

```js
render(h(WordCount))
```
