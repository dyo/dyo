import {h, render, Component} from 'dyo'

describe('Exception', () => {
	it('should not render invalid elements', () => {
		const target = document.createElement('div')

		assert.throws(() => {
			render(h('div', {}, {}), target)
		})

		assert.throws(() => {
			render(h({}), target)
		})

		assert.throws(() => {
			render(h(Symbol()), target)
		})
	})

	it('should not render to an invalid target', () => {
		assert.throws(() => {
			render('hello', {}, (current) => {
				throw 'error!'
			})
		})
	})

	it('should catch exceptions from invalid element type', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		render(h(Primary, h(Component, h('!'))), target, (current) => {
			assert.lengthOf(stack, 1)
			assert.html(current, '')
		})

		render(h(Primary, h(Component, h(Symbol()))), target, (current) => {
			assert.lengthOf(stack, 2)
			assert.html(current, '')
		})
	})

	it('should invoke componentDidCatch on a exception with the right arguments', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error, {componentStack}) { stack.push(error, componentStack) }
		}

		class Secondary extends Component {
			constructor() { throw 'constructor' }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, ['constructor', '\tat Primary\n\tat Secondary\n'])
			assert.html(current, '')
		})
	})

	it('should catch exceptions from constructor', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			constructor() { throw 'constructor' }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, ['constructor'])
			assert.html(current, '')
		})
	})

	it('should catch exceptions from getDerivedState(mount)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			getDerivedState() { throw 'getDerivedState' }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, ['getDerivedState'])
			assert.html(current, '')
		})
	})

	it('should catch exceptions from getChildContext(mount)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			getChildContext() { throw 'getChildContext' }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, ['getChildContext'])
			assert.html(current, '')
		})
	})

	it('should catch exceptions from render(mount)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			render() { throw 'render' }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, ['render'])
			assert.html(current, '')
		})
	})

	it('should catch exceptions from componentDidMount', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			componentDidMount() { throw 'componentDidMount' }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, ['componentDidMount'])
			assert.html(current, '1')
		})
	})

	it('should catch exceptions from getDerivedState(update)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			getDerivedState(props) { if (props.children !== 1) { throw 'getDerivedState' } }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(current, '1')
		})

		render(h(Primary, h(Secondary, 2)), target, (current) => {
			assert.deepEqual(stack, ['getDerivedState'])
			assert.html(current, '1')
		})
	})

	it('should catch exceptions from shouldComponentUpdate(update)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			shouldComponentUpdate() { throw 'shouldComponentUpdate' }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(current, '1')
		})

		render(h(Primary, h(Secondary, 2)), target, (current) => {
			assert.deepEqual(stack, ['shouldComponentUpdate'])
			assert.html(current, '1')
		})
	})

	it('should catch exceptions from getChildContext(update)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			getChildContext(props) { if (props.children !== 1) { throw 'getChildContext' } }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(current, '1')
		})

		render(h(Primary, h(Secondary, 2)), target, (current) => {
			assert.deepEqual(stack, ['getChildContext'])
			assert.html(current, '1')
		})
	})

	it('should catch exceptions from render(update)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			render(props) { if (props.children !== 1) { throw 'render' } else { return props.children } }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(current, '1')
		})

		render(h(Primary, h(Secondary, 2)), target, (current) => {
			assert.deepEqual(stack, ['render'])
			assert.html(current, '1')
		})
	})

	it('should catch exceptions from componentDidUpdate(update)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			componentDidUpdate(props) { throw 'componentDidUpdate' }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(current, '1')
		})

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, ['componentDidUpdate'])
			assert.html(current, '1')
		})
	})

	it('should catch exceptions from setState(function)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			componentDidMount() { this.setState(() => { throw 'setState(function)' }) }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, ['setState(function)'])
			assert.html(target, '1')
		})
	})

	it('should catch exceptions from setState(callback)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push(error) }
		}

		class Secondary extends Component {
			componentDidMount() { this.setState({}, () => { throw 'setState(callback)' }) }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, ['setState(callback)'])
			assert.html(target, '1')
		})
	})

	it('should recover exceptions from getDerivedState(update)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { return stack.push(error), this.props = {children: 3} }
		}

		class Secondary extends Component {
			getDerivedState(props) { if (props.children !== 1) { throw 'getDerivedState' } }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(current, '1')
		})

		render(h(Primary, h(Secondary, 2)), target, (current) => {
			assert.deepEqual(stack, ['getDerivedState'])
			assert.html(current, '3')
		})
	})

	it('should recover exceptions from shouldComponentUpdate(update)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { return stack.push(error), this.props = {children: 3} }
		}

		class Secondary extends Component {
			shouldComponentUpdate() { throw 'shouldComponentUpdate' }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(current, '1')
		})

		render(h(Primary, h(Secondary, 2)), target, (current) => {
			assert.deepEqual(stack, ['shouldComponentUpdate'])
			assert.html(current, '3')
		})
	})

	it('should recover exceptions from getChildContext(update)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { return stack.push(error), this.props = {children: 3} }
		}

		class Secondary extends Component {
			getChildContext(props) { if (props.children !== 1) { throw 'getChildContext' } }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(current, '1')
		})

		render(h(Primary, h(Secondary, 2)), target, (current) => {
			assert.deepEqual(stack, ['getChildContext'])
			assert.html(current, '3')
		})
	})

	it('should recover exceptions from render(update)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { return stack.push(error), this.props = {children: 3} }
		}

		class Secondary extends Component {
			render(props, state) { if (props.children !== 1) { throw 'render' } else { return props.children } }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(current, '1')
		})

		render(h(Primary, h(Secondary, 2)), target, (current) => {
			assert.deepEqual(stack, ['render'])
			assert.html(current, '3')
		})
	})

	it('should recover exceptions from componentDidUpdate(update)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { return stack.push(error), this.props = {children: 3} }
		}

		class Secondary extends Component {
			componentDidUpdate() { throw 'componentDidUpdate' }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(current, '1')
		})

		render(h(Primary, h(Secondary, 2)), target, (current) => {
			assert.deepEqual(stack, ['componentDidUpdate'])
			assert.html(current, '3')
		})
	})

	it('should recover exceptions from setState(function)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { return stack.push(error), this.props = {children: 3} }
		}

		class Secondary extends Component {
			componentDidUpdate() { this.setState(() => { throw 'setState(function)' }) }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(target, '1')
		})

		render(h(Primary, h(Secondary, 2)), target, (current) => {
			assert.deepEqual(stack, ['setState(function)'])
			assert.html(target, '3')
		})
	})

	it('should recover exceptions from setState(callback)', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { return stack.push(error), this.props = {children: 3} }
		}

		class Secondary extends Component {
			componentDidUpdate() { if (!this.state.value) { this.setState({value: 1}, () => { throw 'setState(callback)' }) } }
		}

		render(h(Primary, h(Secondary, 1)), target, (current) => {
			assert.deepEqual(stack, [])
			assert.html(target, '1')
		})

		render(h(Primary, h(Secondary, 2)), target, (current) => {
			assert.deepEqual(stack, ['setState(callback)'])
			assert.html(target, '3')
		})
	})

	it('should not catch exceptions', () => {
		const target = document.createElement('div')
		const stack = assert.spyr(console, 'error')

		assert.throws(() => {
			render(function Primary () { throw 'error!' }, target)
		}, 'error!')
		assert.deepEqual(stack, ['\tat Primary\n'])
	})

	it('should throw in refs', () => {
		const target = document.createElement('div')

		assert.throws(() => {
			render(h('div', {ref: () => { throw 'error!' }}), target)
		}, 'error!')
	})

	it('should throw in render callback', () => {
		const target = document.createElement('div')

		assert.throws(() => render(h('div'), target, (current) => {
			throw 'error!'
		}), 'error!')
	})
})
