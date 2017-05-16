/// <reference path="../dio.d.ts" />

class A extends dio.Component<any> {
	render() {
		return <h1 color='red'></h1>
	}
}

const foo = h('string', {className: 1}, 1, '')
const clone = h(foo)
const comps = h(A)

dio.render(foo, document.body)

