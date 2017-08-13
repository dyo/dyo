module.exports = ({h, render, Component}) => {
	test('Lifecycle', ({ok, end}) => {
		var container = document.createElement('div')

		class Bar {
			componentWillUpdate() { ok(true, 'componentWillUpdate#Composite') }
			componentDidUpdate() { ok(true, 'componentDidUpdate#Composite') }
			render() { return h('h1', this.props.id); }
		}

		class Foo {
			componentWillMount() { ok(true, 'componentWillMount') }
			componentDidMount() { ok(true, 'componentDidMount') }
			componentWillUpdate() { ok(true, 'componentWillUpdate') }
			componentDidUpdate() { ok(true, 'componentDidUpdate') }
			componentWillReceiveProps() { ok(true, 'componentWillReceiveProps') }
			componentWillUnmount() { ok(true, 'componentWillUnmount') }
			shouldComponentUpdate() { ok(true, 'shouldComponentUpdate') }
			render() { return Bar}
		}			

		render(h(Foo, {id: 1}), container)
		render(h(Foo, {id: 1}), container)
		render(null, container)

		var stages = []

		class A {
			componentWillUnmount() {stages.push('1')}
			render(){}
		}

		class B {
			componentDidUpdate() {stages.push('5')}
			componentWillUpdate(nextProps, nextState) {stages.push('4')}
			shouldComponentUpdate() {stages.push('3')}
			componentWillReceiveProps() {stages.push('2')}
			componentWillMount() {stages.push('0')}
			render(){}
		}

		render(A, container)
		render(B, container)
		render(B, container)

		ok(stages.join('') === '012345', 'Will/DidMount, ReceiveProps, shouldUpdate, Will/Didupdate, WillUnmount')

		end()
	})

	test('Constructor', ({ok, end}) => {
		var container = document.createElement('div')

		class A extends Component {
			constructor() {super()}
			render() {return h('h1', this.props.value)}
		}

		class B extends Component {
			constructor(props) {super(props)}
			render() {return h('h1', this.props.value)}
		}

		render(h(A, {value: 'Hello'}), container)
		ok(container.innerHTML === '<h1>Hello</h1>', 'super(props)')

		render(h(B, {value: 'Hello'}), container)
		ok(container.innerHTML === '<h1>Hello</h1>', 'super()')

		end()
	})

	// @TODO test async render and unmount
}
