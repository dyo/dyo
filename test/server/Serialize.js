import {h, render, Component} from '../../server/index.js'

describe('Serialize', () => {
	it('should not write to non-wrtiable', () => {
		const target = {}

		render('1', target, (current) => {
			assert.html(current, '')
		})
	})

	it('should write to wrtiable', () => {
		const target = new Writable

		render('1', target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should set headers', () => {
		const target = new Writable

		render('1', target, (current) => {
			assert.deepEqual(current.headers, {'content-type': 'text/html'})
		})
	})

	it('should not set headers', () => {
		const target = new Writable

		delete target.headers

		render('1', target, (current) => {
			assert.deepEqual(current.headers, undefined)
		})
	})

	it('should end writable', () => {
		const target = new Writable
		const stack = []

		target.end = () => stack.push('end')

		render('1', target).then((current) => {
			assert.deepEqual(stack, ['end'])
		})
	})

	it('should end writable', () => {
		const target = new Writable
		const stack = []

		target.end = () => stack.push('end')

		render('1', target, (current) => current.finished = true).then((current) => {
			assert.deepEqual(stack, [])
		})
	})

	it('should invoke lifecycle methods', () => {
		const target = new Writable
		const stack = []

		class Primary extends Component {
			componentDidMount() { stack.push('componentDidMount') }
		}

		render(h(Primary, 1), target, (current) => {
			assert.deepEqual(stack, ['componentDidMount'])
			assert.html(current, '1')
		})
	})

	it('should invoke setState', () => {
		const target = new Writable
		const stack = []

		class Primary extends Component {
			componentDidMount() { this.setState({value: 1}) }
			componentDidUpdate() { stack.push('componentDidUpdate', this.state.value) }
		}

		render(h(Primary, 1), target, (current) => {
			assert.deepEqual(stack, ['componentDidUpdate', 1])
			assert.html(current, '1')
		})
	})

	it('should invoke async setState', () => {
		const target = new Writable
		const stack = []

		class Primary extends Component {
			componentDidMount() { this.setState(Promise.resolve({value: 1})) }
			componentDidUpdate() { stack.push('componentDidUpdate', this.state.value) }
		}

		render(h(Primary, 1), target, (current) => {
			assert.deepEqual(stack, ['componentDidUpdate', 1])
			assert.html(current, '1')
		})
	})

	it('should invoke error boundaries', () => {
		const target = new Writable
		const stack = []

		class Primary extends Component {
			componentDidCatch(err) {
				stack.push(err)
			}
			render(props, state) {
				return h(Secondary, state.children)
			}
		}

		class Secondary extends Component {
			render() { throw 'componentDidCatch' }
		}

		render(h(Primary, 1), target, (current) => {
			assert.deepEqual(stack, ['componentDidCatch'])
			assert.html(current, '')
		})
	})

	it('should recover from error boundaries', () => {
		const target = new Writable
		const stack = []

		class Primary extends Component {
			componentDidCatch(err) {
				this.setState({children: stack.push(err)})
			}
			render(props, state) {
				return h(Secondary, state.children)
			}
		}

		class Secondary extends Component {
			render(props) { if (props.children) { return props.children } else { throw 'componentDidCatch' } }
		}

		render(h(Primary, 1), target, (current) => {
			assert.deepEqual(stack, ['componentDidCatch'])
			assert.html(current, '1')
		})
	})

	it('should recover from async error boundaries', () => {
		const target = new Writable
		const stack = []

		class Primary extends Component {
			componentDidCatch(err) {
				this.setState(Promise.resolve({children: stack.push(err)}))
			}
			render(props, state) {
				return h(Secondary, state.children)
			}
		}

		class Secondary extends Component {
			render(props) { if (props.children) { return props.children } else { throw 'componentDidCatch' } }
		}

		render(h(Primary, 1), target, (current) => {
			assert.deepEqual(stack, ['componentDidCatch'])
			assert.html(current, '1')
		})
	})
})
