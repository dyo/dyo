/// <reference path="../dio.d.ts" />

interface Props {
	children: Array<any>
}

interface State {
	age: number
}

class A extends dio.Component<Props, State> {
	render(props: Props) {
		return <h1 style='color:red;'>Hello World</h1>
	}
}

const foo = h('h1', {className: 1}, 'foo')
const clone = h(foo)
const component = h(A)

dio.render(foo, document.body)

