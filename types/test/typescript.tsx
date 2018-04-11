/// <reference path="../typescript.d.ts" />

const {h} = dio

interface P {
	value?: Array<any>
	ref?: any
}

interface S {
	name: string
}

class A extends dio.Component<P, S> {
	constructor(props: P){
		super(props)
	}
	getInitialState(props: P) {
		return {name: 'World'}
	}
	getChildContext(props: P, state: S) {
		return {}
	}
	componentDidCatch(error: Error, stack: dio.Exception) {
		console.log(stack.componentStack)
	}
	componentWillReceiveProps(nextProps: P) {

	}
	shouldComponentUpdate(nextProps: P, nextState: S) {
		return true
	}
	componentWillUpdate(nextProps: P, nextState: S) {

	}
	componentDidUpdate(nextProps: P, nextState: S) {

	}
	componentWillMount(nextProps: P, nextState: S) {

	}
	componentDidMount(node: Node) {

	}
	componentWillUnmount(node: Node) {

	}
	render(props: P, state: S) {
		this.setState({name: ''}, (state: any) => {
			state.name
		})

		return <h1 style='color:red;'>Hello {state.name}</h1>
	}
	handeEvent() {

	}
}

const foo = h('h1', {className: 1, onClick: (e) => {
	return {type: e.target}
}}, 'foo')

const bar = h('h1', 1)

h('h1')

const comp = h(A)

dio.render(foo, document.body)
dio.render('', document.body)
dio.cloneElement(h('h1', {}))
dio.cloneElement(h('h1', 1))
dio.isValidElement(h(''))
dio.createElement('h1', 1, 2, 3)
dio.createElement('h1', null)
dio.createElement('h1', {})
dio.createElement(A, {ref: (node) => {
	node.forceUpdate()
}})


var heading = <h1>Heading</h1>
var component = <A value={[]}></A>
var paragraph = <p ref={(node) => {
	node.parentNode.addEventListener('', () => {})
}}></p>
var a = <A ref={(node) => {
	node
}}></A>
var strong = <strong ref="ref"></strong>
var anchor = <a onClick={(e) => {e.BUBBLING_PHASE}}></a>

var factory = dio.createFactory({
	setComment(element, value) {
		element.parent.props
		element.cache = {}
		value.charAt(0)
	},
	setDocument(element) {
		element.owner.parentNode.appendChild
	},
	getListener(element, event) {
		event.preventDefault()
		return () => {}
	}
})

var element = dio.createFactory(A)
var result = element({})

result.handleEvent(event as Event)
