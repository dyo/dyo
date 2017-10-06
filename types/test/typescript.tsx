/// <reference path="../typescript.d.ts" />

interface P {
	children: Array<any>
}

interface S {
	id: number
}

class A extends dio.Component<P, S> {
	constructor(props: P){
		super(props)
	}
	render(props: Readonly<P>, state: Readonly<S>) {
		return <h1 style='color:red;'>Hello World</h1>
	}
}

const foo = h('h1', {className: 1, onClick: (e) => {
	return {type: e.target}
}}, 'foo')

const clone = h(foo)
const component = h(A)

dio.render(foo, document.body)

