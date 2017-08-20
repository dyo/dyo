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
<script src=https://cdnjs.cloudflare.com/ajax/libs/dio/7.1.0/dio.min.js></script>
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

## Highlights

### Render

1. Fragments
2. Promises
3. Iterables
4. Strings
5. etc...

### Components

1. Statefull function Components
2. Plain class Components

### Events

1. Additional support for the `handleEvent` interface.
2. Event listeners `this` points to the closest `Component` instance by default.

### Errors

1. Cascading error boundaries with `componentDidCatch`
3. Additional support for rendering/returning an error state from `componentDidCatch`

### setState

1. Returning an `Object` is equivalent to calling `this.setState`

### Context

1. `getChildContext` supports context updates.
2. `context` cascades without the need for `contextTypes` or `childContextTypes`
3. `context` cascades irrespective of `shouldComponentUpdate`

### Lifecycle

1. additinonal support for lifecycles on function components
2. additional support for async `componentDidUnmount`
3. additional support for async `getInitialState`

### Children

1. `this.props.children` is an opaque data-structure

The easiest way to get started with DIO is to read the [Introduction to DIO](https://dio.js.org/introduction.html) or look at the [API Documentation](https://dio.js.org/api.html).
