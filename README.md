# DIO

[![dio.js](https://dio.js.org/imgs/logo.svg)](https://dio.js.org/)

A Library For Building User Interfaces.

- ~6kb

[![CDNJS](https://img.shields.io/cdnjs/v/dio.svg?style=flat)](https://cdnjs.com/libraries/dio)
[![npm](https://img.shields.io/npm/v/dio.js.svg?style=flat)](https://www.npmjs.com/package/dio.js) [![licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/thysultan/dio.js/blob/master/LICENSE.md) [![Build Status](https://semaphoreci.com/api/v1/thysultan/dio-js/branches/master/shields_badge.svg)](https://semaphoreci.com/thysultan/dio-js)
 ![dependencies](https://img.shields.io/badge/dependencies-none-green.svg?style=flat) [![Join the chat at https://gitter.im/thysultan/dio.js](https://img.shields.io/badge/chat-gitter-green.svg?style=flat)](https://gitter.im/thysultan/dio.js)

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
<script src=https://unpkg.com/dio.js@latest/dist/dio.umd.min.js></script>
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

The easiest way to get started with DIO is to walk through the [Introduction to DIO](https://dio.js.org/introduction.html) or the [API Documentation](https://dio.js.org/api.html).

## Features

### Render

1. Element.
1. Component.
1. Primitive: strings, number, null, undefined.
1. Fragment: Array, Iterable.
1. Async: Promise.
1. Other: Portal, Error.

### Component

1. Statefull function component.
1. Plain class component.

### Event

1. Function or [EventListner](https://developer.mozilla.org/en/docs/Web/API/EventListener).
1. Preserve "this" reference.

### Errors

1. Error Boundary, "componentDidCatch".

### State

1. Object.
1. Promise.
1. Return.

### Lifecycle

1. async componentWillUnmount.

## Example

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
