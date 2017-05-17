/// <reference path="../dio.d.ts" />

interface Props {
	children: Array<any>
}

interface State {
	age: number
}

class A extends dio.Component<Props, State> {
	render(props: Props) {
		return <h1 style='color:red;'></h1>
	}
}

const foo = h('string', {className: 1}, 1, '')
const clone = h(foo)
const comps = h(A)

dio.render(foo, document.body)

