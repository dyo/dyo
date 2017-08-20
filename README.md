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
<script src=https://cdnjs.cloudflare.com/ajax/libs/dio/8.0.0/dio.min.js></script>
```

```html
<script src=https://cdn.jsdelivr.net/npm/dio.js@latest/dio.min.js></script>
```

```html
<script src=https://unpkg.com/dio.js@latest/dio.min.js></script>
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

## Highlights

### Render

1. Fragments
2. Promises
3. Iterables
4. Strings
5. Portals

### Components

1. Statefull function components.
2. Plain class components.

### Events

1. Additional support for the `handleEvent` interface.
2. Event listeners `this` defaults to the closest `Component` relegating the need to `.bind`

### Errors

1. Cascading error boundaries with `componentDidCatch`.
3. Additional support for recovering from an error state from `componentDidCatch` return signature.

### setState

1. Optionally returning an `Object` is equivalent to calling `this.setState`.
2. Additional support for `this.setState(Promise)`

### Context

1. `getChildContext` supports context updates.
3. `context` cascades irrespective of `shouldComponentUpdate` or `contextTypes` and `childContextTypes`.

### Lifecycle

1. Function components lifecycles.
2. Additional support for async `componentDidUnmount` and async `getInitialState`

### Children

1. `this.props.children` is an opaque data-structure.

### Refs

1. Support for string/function refs on both function and class components.
