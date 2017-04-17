## What

An experimental rewrite that puts what i've learnt from the past versions of dio and other projects like react, ivi, preact, inferno, vidom... into a small and rich component api.

## Features

- ~4kb
- resolves ES6 syntax `static propTypes () {}` methods to into a flat structure
- getInitialState accepts promise return types
- extend-less class
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
- support non-deterministic render/update

## When

For the most part it's done. Clamping on possible obscure edge cases.

## Preview

See `playground` directory for examples that you can play with, a few patterns that this allows are as follows.

> Note that all patterns described below can be used without a transpiler in modern browsers.


#### lifecycles on function components

```js
function Foo () {

}
Foo.shouldComponentUpdate = () => {}
Foo.componentWillMount = () => {}
```


#### extend-less classes

```js
class Foo {
	render() {
		return 'Foo';
	}
}
```

#### bound less event handlers

```js
class Foo {
	handleClick(props, state, event) {
		return {n: Math.random()}
	}
	render(props, {n}) {
		return [
			h('button', {onclick: this.handleClick}, 'Click Me'),
			'Random Number ', n
		]
	}
}
```

#### async getInitialState signature

```js
class Foo {
	async getInitialState() {
		return await fetch('data.json').then((v)=>v.toJSON());
	}
	render() {
		// or we could import() a module
		return this.state.users;
	}
}
```

#### static propTypes & defaultProps methods

```js
class Foo {
	static propTypes () {
		return {id: PropTypes.func.isRequired}
	}
	static defaultProps () {
		return {id: 1}
	}
	render () {

	}
}
```

#### array return type

```js
class Foo {
	render () {
		return [1, 2, h('h1', new Date)];
	}
}
```

#### promise return type

```js
class Foo {
	async render () {
		return 'Promise'
	}
}
```
#### promise setState type

```js
class Foo {
	async componentDidUpdate() {
		return {id: 0};
		// or this.setState(Promise.resolve({id: 0}))
	}
	render () {
		return 1+1;
	}
}
```


#### error boundaries

```js
class Foo {
	componentDidThrow({location, message}) {
		if (location === 'render') {
			return h('h1', 'Error State');
		}
	}
	render () {
		throw '';
	}
}
```

#### non-deterministic

```js
class Foo {
	render() {
		return new Promise((resolve)=>{
			setTimeout(()=>{
				resolve(
					h('h1', 'performance now - ', performance.now())
				);
			}, Math.random()*1000);
		})
	}
}

// with Math.random one child can render/update before the other and vice-versa
// the update cycle is no longer linear A -> B -> C
// but can be C -> A -> B or any numebr of variations
class Bar {
	render() {
		return h('div',
			Resolve,
			Resolve
		)
	}
}
```

lifecycles, function refs and callbacks work in a similar fashion to how bound-less events work, the only lifecycles methodes that cannot return new state are `componentWillUnmount` and `shouldComponentUpdate`.

## Future

Explore low-level platform independent diff engine on Javascript VM's using linear memory representation... think heavy use of typed arrays, pointers and threads(SharedArrayBuffer & Web Workers)

```js
[0, 1, 1, 0, ...]: 1024*1024
```

The idea is to have a fixed length typed array that represents instructions and pointers to memory, each instruction encoded in an unsigned ints `0 - 255` and each action encoded in a `[0, 1, 1, 0]` 4, 8 bit ints that could be shared/transfered between Web Workers to allow for parellel work.
