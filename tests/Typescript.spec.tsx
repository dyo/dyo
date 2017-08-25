/// <reference path="../types/dio.d.ts" />

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
	render(props: P) {
		return h('h1', {dangerouslySetInnerHTML: {__html: 1}})
		// return <h1 style='color:red;'>Hello World</h1>
	}
}

const foo = h('h1', {className: 1}, 'foo')
const clone = h(foo)
const component = h(A)

dio.render(foo, document.body)

