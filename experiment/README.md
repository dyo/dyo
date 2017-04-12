## What

An experimental rewrite that puts what i've learnt from the past versions of dio and other projects into a small and rich component API.

## Features

- ~4kb
- extend less class
- supports lifecycle methods on functional components
- bound less event handlers, think no `this.fn = this.fn.bind()`
- event handlers recieve `props, state, event` arguments
- return state from event handles
- return state from lifecycles
- return state from function refs and callbacks
- error boundaries
- promise return type
- fragment return type
- pause, fetch data, resume pattern

## When

For the most part it's done. Claping on possible obscure edge cases.

## Future

Explore low-level platform independent diff engine on Javascript VM's using linear memory representation... think heavy use of typed arrays, pointers and threads(SharedArrayBuffer & Web Workers)

```js
[0, 1, 1, 0, ...]: 1024*1024
```

The idea is to have a fixed length typed array that represents instructions and pointers to memory, each instruction encoded in an unsigned ints `0 - 255` and each action encoded in a `[0, 1, 1, 0]` 4, 8 bit ints that could be shared/transfered between Web Workers to allow for parellel work.
