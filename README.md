# DIO

[![dio.js](https://dio.js.org/imgs/logo.svg)](https://dio.js.org/)

A Library For Building User Interfaces.

- ~6kb

[![licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/thysultan/dio.js/blob/master/LICENSE.md)
[![npm](https://img.shields.io/npm/v/dio.js.svg?style=flat)](https://www.npmjs.com/package/dio.js)
[![CDNJS](https://img.shields.io/cdnjs/v/dio.svg?style=flat)](https://cdnjs.com/libraries/dio)
[![Build Status](https://semaphoreci.com/api/v1/thysultan/dio-js/branches/master/shields_badge.svg)](https://semaphoreci.com/thysultan/dio-js)
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
<script src=https://unpkg.com/dio.js@latest></script>
<script src=https://cdn.jsdelivr.net/npm/dio.js@latest></script>
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
	1. Primitives like strings, number, null, undefined
	1. Fragment like Array, Iterable
	1. and others renderables like Promises and Portals

1. ### Components

	1. function component(statefull)
	1. Class component(statefull)

1. ### Events

	1. Functions or [EventListener](https://developer.mozilla.org/en/docs/Web/API/EventListener).
	1. Preserve "this" reference.

1. ### Errors

	1. Error Boundaries, `componentDidCatch`.

1. ### setState

	1. As an Object
	1. As a Promise
	1. As an Implicit return

1. ### Lifecycle

	1. async componentWillUnmount

## Example

This examples presents a few features detailed above, namely – error boundaries, an implicit setState return
and fragments.

```js
class Input {
	componentDidCatch ({error, stack, message, report}) {
		return error
	}
	async handleInput({target}, props, state) {
		return {value: target.value}
	}
	render(props, {value}, context) {
		return [
			h('input', {onInput: this.handleInput, value: value})
		]
	}
}

dio.render(h(Input))
```

--

## Links

1. [Introduction to DIO](https://dio.js.org/introduction)
2. [API Documentation](https://dio.js.org/api)
3. [REPL](https://dio.js.org/repl)
