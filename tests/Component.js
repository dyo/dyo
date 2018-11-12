import {h, Component, PureComponent, render} from 'dyo'

describe('Component', () => {
	it('should forward component children', () => {
		const target = document.createElement('div')

		render(h(Component, 'Primary'), target, (current) => {
			assert.html(current, 'Primary')
		})
	})

	it('should render a function Component', () => {
		const target = document.createElement('div')

		const Primary = function ({children}) { return children }

		render(h(Primary, 'Primary'), target, (current) => {
			assert.html(current, 'Primary')
		})
	})

	it('should replace a function Component', () => {
		const target = document.createElement('div')
		const stack = []

		const Primary = function ({children}) { return children }
		Primary.componentWillUnmount = () => stack.push('componentWillUnmount')

		render(h(Primary, {key: 1}, 'Primary'), target, (current) => {
			assert.html(current, 'Primary')
		})

		render(h(Primary, {key: 2}, 'Primary'), target, (current) => {
			assert.html(current, 'Primary')
			assert.deepEqual(stack, ['componentWillUnmount'])
		})
	})

	it('should render an arrow function Component', () => {
		const target = document.createElement('div')

		const Primary = ({children}) => children

		render(h(Primary, 'Primary'), target, (current) => {
			assert.html(current, 'Primary')
		})
	})

	it('should render a class that extends Component', () => {
		const target = document.createElement('div')

		class Primary extends Component { render({children}) { return children } }

		render(h(Primary, 'Primary'), target, (current) => {
			assert.html(current, 'Primary')
		})
	})

	it('should render a class that does not extend Component', () => {
		const target = document.createElement('div')

		class Primary { render({children}) { return children } }

		render(h(Primary, 'Primary'), target, (current) => {
			assert.html(current, 'Primary')
		})
	})

	it('should provide a default render method', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidMount() { stack.push('componentDidMount') }
		}

		render(h(Primary, 'Primary'), target, (current) => {
			assert.html(current, 'Primary')
			assert.deepEqual(stack, ['componentDidMount'])
		})
	})

	it('should call lifecycle methods on class component', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary {
			constructor() { stack.push('constructor') }
			getDerivedState() { stack.push('getDerivedState') }
			componentDidMount() { stack.push('componentDidMount') }
			shouldComponentUpdate() { return !!stack.push('shouldComponentUpdate') }
			componentDidUpdate() { stack.push('componentDidUpdate') }
			componentWillUnmount() { stack.push('componentWillUnmount') }
			render() { stack.push('render') }
		}

		render(h(Primary), target)
		render(h(Primary), target)
		render(null, target, (current) => {
			assert.deepEqual(stack, [
				'constructor',
				'getDerivedState',
				'render',
				'componentDidMount',
				'getDerivedState',
				'shouldComponentUpdate',
				'render',
				'componentDidUpdate',
				'componentWillUnmount'
			])
		})
	})

	it('should call lifecycle methods on function component', () => {
		const target = document.createElement('div')
		const stack = []

		const Primary = () => { stack.push('render') }
		Primary.getDerivedState = () => { stack.push('getDerivedState') }
		Primary.componentDidMount = () => { stack.push('componentDidMount') }
		Primary.shouldComponentUpdate = () => { return !!stack.push('shouldComponentUpdate') }
		Primary.componentDidUpdate = () => { stack.push('componentDidUpdate') }
		Primary.componentWillUnmount = () => { stack.push('componentWillUnmount') }

		render(h(Primary), target)
		render(h(Primary), target)
		render(null, target, (current) => {
			assert.deepEqual(stack, [
				'getDerivedState',
				'render',
				'componentDidMount',
				'getDerivedState',
				'shouldComponentUpdate',
				'render',
				'componentDidUpdate',
				'componentWillUnmount'
			])
		})
	})

	it('should call (un)mount lifecycle in the right order', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary {
			getDerivedState() { stack.push('getDerivedState Primary') }
			componentDidMount() { stack.push('componentDidMount Primary') }
			componentWillUnmount() { stack.push('componentWillUnmount Primary') }
			render({children}) { return children }
		}

		class Secondary {
			getDerivedState() { stack.push('getDerivedState Secondary') }
			componentDidMount() { stack.push('componentDidMount Secondary') }
			componentWillUnmount() { stack.push('componentWillUnmount Secondary') }
			render({children}) { return children }
		}

		class Tertiary {
			getDerivedState() { stack.push('getDerivedState Tertiary') }
			componentDidMount() { stack.push('componentDidMount Tertiary') }
			render({children}) { return children }
		}

		render(h(Primary, h(Secondary, 'Secondary')), target)
		render(h(Tertiary, 'Tertiary'), target, (current) => {
			assert.html(current, 'Tertiary')
			assert.deepEqual(stack, [
				'getDerivedState Primary',
				'getDerivedState Secondary',
				'componentDidMount Secondary',
				'componentDidMount Primary',
				'getDerivedState Tertiary',
				'componentWillUnmount Primary',
				'componentWillUnmount Secondary',
				'componentDidMount Tertiary'
			])
		})
	})

	it('should update Component', () => {
		const target = document.createElement('div')

		class Primary {
			shouldComponentUpdate() { return true }
			render({children}) { return children }
		}

		render(h(Primary, '1'), target)
		render(h(Primary, '2'), target, (current) => {
			assert.html(current, '2')
		})
	})

	it('should not update Component', () => {
		const target = document.createElement('div')

		class Primary {
			shouldComponentUpdate() { return false }
			render({children}) { return children }
		}

		render(h(Primary, '1'), target)
		render(h(Primary, '2'), target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should force update Component', () => {
		const target = document.createElement('div')
		const refs = {children: 1}

		class Primary {
			componentDidMount() { refs.current = this }
			shouldComponentUpdate() { return false }
			render() { return refs.children }
		}

		render(h(Primary), target, (current) => {
			assert.html(current, '1')

			refs.children = 2
			refs.current.setState({}, () => {
				assert.html(current, '1')
				refs.current.forceUpdate(() => {
					assert.html(current, '2')
				})
			})
		})
	})

	it('should update PureComponent', () => {
		const target = document.createElement('div')

		class Primary extends PureComponent {
			render({children}) { return children }
		}

		render(h(Primary, {a: 1}, 1), target)
		render(h(Primary, {a: 2}, 2), target, (current) => {
			assert.html(current, '2')
		})
	})

	it('should update PureComponent', () => {
		const target = document.createElement('div')

		class Primary extends PureComponent {
			render({children}) { return children }
		}

		render(h(Primary, {a: 1}, 1), target)
		render(h(Primary, {}, 2), target, (current) => {
			assert.html(current, '2')
		})
	})

	it('should not update PureComponent', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends PureComponent {
			render ({children}) { return children }
			componentDidUpdate() { stack.push('componentDidUpdate') }
		}

		render(h(Primary, {value: 1}, 1), target)
		render(h(Primary, {value: 1}, 1), target, (current) => {
			assert.html(current, '1')
			assert.deepEqual(stack, [])
		})
	})

	it('should use Object.is sementics for PureComponent updates', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends PureComponent {
			render({children}) { return children }
			componentDidUpdate(props) { stack.push('componentDidUpdate', this.props.value, props.value) }
		}

		render(h(Primary, {value: +0}, 1), target)
		render(h(Primary, {value: -0}, 1), target, (current) => {
			assert.html(current, '1')
			assert.deepEqual(stack, ['componentDidUpdate', -0, 0])
		})

		render(h(Primary, {value: NaN}, 1), target, (current) => {
			assert.html(current, '1')
			assert.deepEqual(stack, ['componentDidUpdate', -0, 0, 'componentDidUpdate', NaN, -0])
		})
		render(h(Primary, {value: NaN}, 1), target, (current) => {
			assert.html(current, '1')
			assert.deepEqual(stack, ['componentDidUpdate', -0, 0, 'componentDidUpdate', NaN, -0])
		})
	})

	it('should update state from class component lifecycle', () => {
		const target = document.createElement('div')

		class Primary extends Component {
			componentDidMount() { return {value: 'Primary'} }
			render(props, state) { return state.value }
		}

		render(Primary, target, (current) => {
			assert.html(current, 'Primary')
		})
	})

	it('should update state from a function component lifecycle', () => {
		const target = document.createElement('div')

		const Primary = (props, state) => state.value
		Primary.componentDidMount = () => ({value: 'Primary'})

		render(Primary, target, (current) => {
			assert.html(current, 'Primary')
		})
	})

	it('should initialize state with getDerivedState', () => {
		const target = document.createElement('div')

		class Primary extends Component {
			getDerivedState() { return {value: 'Primary'} }
			render(props, state) { return state.value }
		}

		render(Primary, target, (current) => {
			assert.html(current, 'Primary')
		})
	})

	it('should initialize state to default object', () => {
		const target = document.createElement('div')

		class Primary extends Component {
			getDerivedState() {}
			render(props, state) { return Object.keys(state) }
		}

		render(h(Primary), target, (current) => {
			assert.html(target, '')
		})
	})

	it('should pass props, state, context to getDerivedState', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			getChildContext() { return {value: 'context'} }
		}

		class Secondary extends Component  {
			static defaultProps() { return {value: 'props'} }
			constructor() { super(), this.state = {value: 'state'} }
			getDerivedState(props, state, context) { stack.push(props, state, context) }
		}

		render(h(Primary, h(Secondary)), target, (current) => {
			assert.html(current, '')
			assert.deepEqual(stack, [{value: 'props'}, {value: 'state'}, {value: 'context'}])
		})
	})

	it('should render defaultProps(object)', () => {
		const target = document.createElement('div')

		class Primary extends Component {}
		Primary.defaultProps = {children: 1}

		render(Primary, target, (current) => {
			assert.html(target, '1')
		})
	})

	it('should render defaultProps(function)', () => {
		const target = document.createElement('div')

		class Primary extends Component {static defaultProps() { return {children: 2} } }

		render(Primary, target, (current) => {
			assert.html(target, '2')
		})
	})

	it('should not render a explicit setState(null)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			getDerivedState() { return {value: 1} }
			componentDidMount() { this.setState(null) }
			render() { return stack.push(1), this.state.value }
		}

		render(h(Primary), target, (current) => {
			assert.lengthOf(stack, 1)
			assert.html(target, '1')
		})
	})

	it('should not render implicit setState(null)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			getDerivedState() { return {value: 1} }
			componentDidMount() { return null }
			render() { return stack.push(1), this.state.value }
		}

		render(h(Primary), target, (current) => {
			assert.lengthOf(stack, 1)
			assert.html(target, '1')
		})
	})

	it('should setState(function)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			constructor() { super(), this.state = {value: 0} }
			componentDidMount() { this.setState((state) => ({value: stack.push(state, this.state)})) }
			render(props, state) { return state.value }
		}

		render(h(Primary), target, (current) => {
			assert.deepEqual(stack, [{}, {value: 0}])
			assert.html(current, '2')
		})
	})

	it('should set state from componentDidMount', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidMount(props, state) { return {value: 'Primary'} }
			render(props, state) { return state.value }
		}

		render(h(Primary), target, (current) => {
			assert.html(current, `Primary`)
		})
	})

	it('should set state from componentDidUpdate', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidUpdate(props, state) { return !state.value && {value: 'Primary'} }
			render(props, state) { return state.value || props.children }
		}

		render(h(Primary, 1), target, (current) => {
			assert.html(current, `1`)
		})

		render(h(Primary, 1), target, (current) => {
			assert.html(current, `Primary`)
		})
	})

	it('should should remove a component from a list of host elements', () => {
		const target = document.createElement('div')
		const A = ({children}) => children

		render(h('div', h(A, {key: 'A'}, h('h1', 'A')), h('div', {key: 'B'}, 'B')), target, (current) => {
			assert.html(target, `<div><h1>A</h1><div>B</div></div>`)
		})

		render(h('div', h('div', {key: 'B'}, 'B')), target, (current) => {
			assert.html(target, `<div><div>B</div></div>`)
		})
	})

	it('should invoke setState(..., callback)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidMount() { this.setState({}, (current) => { stack.push(current) }) }
		}

		render(h(Primary, 1), target, (current) => {
			assert.html(target, '1')
			assert.containsAllKeys(stack.pop(), ['props', 'state', 'context', 'refs'])
		})
	})

	it('should call forceUpdate(callback)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidMount() { this.forceUpdate((current) => { stack.push(current) }) }
		}

		render(h(Primary, 1), target, (current) => {
			assert.html(current, '1')
			assert.containsAllKeys(stack.pop(), ['props', 'state', 'context', 'refs'])
		})
	})

	it('should not call setState(..., callback)', () => {
		const target = document.createElement('div')

		class Primary extends Component {
			componentDidMount() { this.setState({}, 'should not throw') }
		}

		render(h(Primary, 1), target, (current) => {
			assert.html(target, '1')
		})
	})

	it('should render a generator class component', () => {
		const target = document.createElement('div')

		class Primary extends Component {
			*render() { yield 1, yield 2 }
		}

		render(h(Primary), target, (current) => {
			assert.html(current, '12')
		})
	})

	it('should render a generator function component', () => {
		let target = document.createElement('div')

		const Primary = function* () { yield 1, yield 2 }

		render(h(Primary), target, (current) => {
			assert.html(target, '12')
		})
	})

	it('should render and update an async class component', () => {
		const target = document.createElement('div')

		class Primary extends Component {
			async render({children}) { return children }
		}

		render(h(Primary, 1), target, (current) => {
			assert.html(target, '1')

			render(h(Primary, 2), target, (current) => {
				assert.html(target, '2')
			})
		})
	})

	it('should render and update an async function component', () => {
		const target = document.createElement('div')

		const Primary = async function ({children}) { return children }

		render(h(Primary, 1), target, (current) => {
			assert.html(target, '1')

			render(h(Primary, 2), target, (current) => {
				assert.html(target, '2')
			})
		})
	})

	it('should render an async imports defualt export', () => {
		const target = document.createElement('div')

		class Primary extends Component {
			async render({children}) { return {default: children} }
		}

		render(h(Primary, 1), target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should async defer unmount', () => {
		const target = document.createElement('div')
		const refs = {}

		class Primary extends Component {
			async componentWillUnmount() { return refs.current = Promise.resolve() }
		}

		render(h(Primary, 1), target, (current) => {
			assert.html(current, '1')
		})

		render(null, target, (current) => {
			refs.current.then(() => assert.html(current, ''))
		})
	})

	it('should handle async implicit setState in lifecycles', () => {
		const target = document.createElement('div')

		class Primary extends Component {
			render(props, {children}) {
				return children
			}
			componentDidMount(props) {
				return {children: 'Hello'}
			}
		}

		render(h(Primary), target, (current) => {
			assert.html(current, 'Hello')
		})
	})

	it('should render a placeholder before async mount', () => {
		const target = document.createElement('div')

		class Primary extends Component {}

		render(h(Primary, h(Promise.resolve(1), 'Loading')), target, (current) => {
			assert.html(target, '1')
		})

		assert.html(target, 'Loading')
	})

	it('should handle concurrect updates', () => {
		const target = document.createElement('div')

		class Primary extends Component {}

		render(h(Primary, h(Promise.resolve(1), 'Loading')), target, (current) => {
			assert.html(current, '2')
		})

		assert.html(target, 'Loading')

		render(2, target, (current) => {
			assert.html(current, '2')
		})
	})
})
