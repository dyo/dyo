/// <reference path="../typescript.d.ts" />

const {h} = dio

interface P {
	children: Array<any>
}

interface S {
	name: string
}

class A extends dio.Component<P, S> {
	constructor(props: P){
		super(props)
	}
	getInitialState(props: P) {
		return {
			name: 'World'
		}
	}
	componentDidMount() {

	}
	render(props: Readonly<P>, state: Readonly<S>) {
		this.setState({name: ''})

		return <h1 style='color:red;'>Hello {state.name}</h1>
	}
}

const foo = h('h1', {className: 1, onClick: (e) => {
	return {type: e.target}
}}, 'foo')

h('h1').children.length

const clone = h(foo)
const component = h(A)

dio.render(foo, document.body)

