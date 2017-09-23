describe('Component', () => {
	it('should extend Component', () => {
		let container = document.createElement('div')

		render(class extends Component {
			render() {
				return '1'
			}
		}, container)

		assert.html(container, '1')
	})

	it('should not extend Component', () => {
		let container = document.createElement('div')

		render(class {
			render() {
				return '1'
			}
		}, container)

		assert.html(container, '1')
	})

	it('should call lifecycle methods on class component', () => {
		let container = document.createElement('div')
		let stack = []
		let A = class {
			constructor() { stack.push('constructor') }
			getInitialState() { stack.push('getInitialState') }
			componentWillMount() { stack.push('componentWillMount') }
			componentDidMount() { stack.push('componentDidMount') }
			componentWillReceiveProps() { stack.push('componentWillReceiveProps') }
			shouldComponentUpdate() { stack.push('shouldComponentUpdate') }
			componentWillUpdate() { stack.push('componentWillUpdate') }
			componentDidUpdate() { stack.push('componentDidUpdate') }
			componentWillUnmount() { stack.push('componentWillUnmount') }
			render() { stack.push('render') }
		}

		render(A, container)
		render(A, container)
		unmountComponentAtNode(container)

		assert.deepEqual(stack, [
			'constructor',
			'getInitialState',
			'componentWillMount',
			'render',
			'componentDidMount',
			'componentWillReceiveProps',
			'shouldComponentUpdate',
			'componentWillUpdate',
			'render',
			'componentDidUpdate',
			'componentWillUnmount'
		])
	})

	it('should call lifecycle methods on function component', () => {
		let container = document.createElement('div')
		let stack = []
		let A = () => { stack.push('render') }
		A.getInitialState = () => { stack.push('getInitialState') }
		A.componentWillMount = () => { stack.push('componentWillMount') }
		A.componentDidMount = () => { stack.push('componentDidMount') }
		A.componentWillReceiveProps = () => { stack.push('componentWillReceiveProps') }
		A.shouldComponentUpdate = () => { stack.push('shouldComponentUpdate') }
		A.componentWillUpdate = () => { stack.push('componentWillUpdate') }
		A.componentDidUpdate = () => { stack.push('componentDidUpdate') }
		A.componentWillUnmount = () => { stack.push('componentWillUnmount') }

		render(A, container)
		render(A, container)
		unmountComponentAtNode(container)

		assert.deepEqual(stack, [
			'getInitialState',
			'componentWillMount',
			'render',
			'componentDidMount',
			'componentWillReceiveProps',
			'shouldComponentUpdate',
			'componentWillUpdate',
			'render',
			'componentDidUpdate',
			'componentWillUnmount'
		])
	})

	it('should call (un)mount in the right order', () => {
		let container = document.createElement('div')
		let stack = []

		render(class A {
			componentDidMount() {
				stack.push('mount A')
			}
			componentWillUnmount() {
				stack.push('unmount A')
			}
			render() {
				return class B {
					componentDidMount() {
						stack.push('mount B')
					}
					componentWillUnmount() {
						stack.push('unmount B')
					}
					render() {
						return 'B'
					}
				}
			}
		}, container)

		render(class C {
			componentDidMount() {
				stack.push('mount C')
			}
			render() {
				return 'C'
			}
		}, container)

		assert.html(container, 'C')
		assert.deepEqual(stack, [
			'mount B',
			'mount A',
			'mount C',
			'unmount B',
			'unmount A'
		])
	})

	it('should provide context', () => {
		let container = document.createElement('div')
		let counter = 0
		let A = class {
			getChildContext() {
				return {
					children: counter++
				}
			}
			render() {
				return class {
					render() {
						return class {
							render(props, state, {children}) {
								return class {
									render(props, state, {children}) {
										return children
									}
								}
							}
						}
					}
				}
			}
		}

		render(A, container)

		assert.html(container, '0')
	})

	it('should update context', () => {
		let container = document.createElement('div')
		let counter = 0
		let A = class {
			getChildContext() {
				return {
					children: counter++
				}
			}
			render() {
				return class {
					render() {
						return class {
							render(props, state, {children}) {
								return class {
									render(props, state, {children}) {
										return children
									}
								}
							}
						}
					}
				}
			}
		}

		render(A, container)
		render(A, container)

		assert.html(container, '1')
	})

	it('should update context with shouldComponentUpdate present', () => {
		let container = document.createElement('div')
		let counter = 0
		let A = class {
			getChildContext() {
				return {
					children: counter++
				}
			}
			render() {
				return class {
					render() {
						return class {
							shouldComponentUpdate() {
								return false
							}
							render(props, state, {children}) {
								return class {
									render(props, state, {children}) {
										return children
									}
								}
							}
						}
					}
				}
			}
		}

		render(A, container)
		render(A, container)

		assert.html(container, '1')
	})

	it('should branch context', () => {
		let container = document.createElement('div')
		let counter = 0
		let A = class {
			getChildContext() {
				return {
					children: counter++
				}
			}
			render() {
				return class {
					render() {
						return class {
							getChildContext(props, state, context) {
								return {
									children: context.children + 1
								}
							}
							render(props, state, {children}) {
								return class {
									render(props, state, {children}) {
										return children
									}
								}
							}
						}
					}
				}
			}
		}

		render(A, container)

		assert.html(container, '1')
	})

	it('should update Component', () => {
		let container = document.createElement('div')
		let A = class {
			shouldComponentUpdate() {
				return true
			}
			render({children}) {
				return children
			}
		}

		render(h(A, '1'), container)
		render(h(A, '2'), container)

		assert.html(container, '2')
	})

	it('should not update Component', () => {
		let container = document.createElement('div')
		let A = class {
			shouldComponentUpdate() {
				return false
			}
			render({children}) {
				return children
			}
		}

		render(h(A, '1'), container)
		render(h(A, '2'), container)

		assert.html(container, '1')
	})

	it('should update PureComponent', () => {
		let container = document.createElement('div')
		let A = class extends PureComponent {
			render () {
				return ++counter
			}
		}

		let counter = 0

		render(h(A, {children: 1}), container)
		render(h(A, {children: 2}), container)

		assert.html(container, '2')
	})

	it('should not update PureComponent', () => {
		let container = document.createElement('div')
		let A = class extends PureComponent {
			render () {
				return ++counter
			}
		}

		let counter = 0

		render(h(A, {children: 1}), container)
		render(h(A, {children: 1}), container)

		assert.html(container, '1')
	})

	it('should update component props', () => {
		let container = document.createElement('div')
		let stack = []
		let Child = class {
			constructor() {
				setStateChild = this.setState.bind(this)
			}
			shouldComponentUpdate(props, state) {
				stack.push(this.props, props)
				return PureComponent.prototype.shouldComponentUpdate.call(this, props, state)
			}
			render({x}) {
			  return h('div', x)
			}
		}
		let Parent = class {
			constructor() {
				setState = this.setState.bind(this)
			}
			getInitialState() {
				return {x: 'abc'}
			}
			render() {
				return h('div', h(Child, {x: this.state.x}))
			}
		}

		let setStateChild = null
		let setState = null

		render(h(Parent), container)
		setState({x: 'xxx'})
		assert.deepEqual(stack[0], {x: 'abc'})
		assert.deepEqual(stack[1], {x: 'xxx'})

		setStateChild({abc: 1})
		assert.deepEqual(stack[2], {x: 'xxx'})
		assert.deepEqual(stack[3], {x: 'xxx'})
	})

	it('should not update component props', () => {
		let container = document.createElement('div');
		let stack = []
		let Child = class {
			constructor() {
				forceUpdateChild = this.forceUpdate.bind(this)
			}
			render({x}) {
				return h('div', x)
			}
		}
		let Root = class {
			constructor() {
				setState = this.setState.bind(this)
			}
			getInitialState() {
				return {locale: {}}
			}
			render() {
				return h('div', h(Child, {
				  x: this.state.locale['xxx']
				}))
			}
		}
		let forceUpdateChild = null
		let setState = null

		render(h(Root), container)
		assert.html(container, '<div><div></div></div>')

		setState({locale: {xxx: 'abc'}})
		assert.html(container, '<div><div>abc</div></div>')

		forceUpdateChild()
		assert.html(container, '<div><div>abc</div></div>')
	})

	it('should setState from a class lifecycle method', (done) => {
		let container = document.createElement('div')
		render(class {
			componentDidMount() {
				return {x: 'value'}
			}
			render() {
				return h('div', this.state.x)
			}
		}, container)

		nextTick(() => {
			assert.html(container, '<div>value</div>')
			done()
		})
	})

	it('should setState from a function component lifecycle method', (done) => {
		let container = document.createElement('div')
		let A = (props, {x}) => h('div', x)
		A.componentDidMount = () => ({x: 'value'})

		render(A, container)

		nextTick(() => {
			assert.html(container, '<div>value</div>')
			done()
		})
	})

	it('should update a nested component in a hoisted tree', () => {
		let container = document.createElement('div')
		let props = {x: 1}
		let A = ({x}) => h(B, {x})
		let B = ({x}) => x
		let hoist = h(A, props)

		render(hoist, container)
		Object.assign(props, {x: 2})
		render(hoist, container)

		assert.html(container, '2')
	})

	it('should getInitialState', () => {
		let container = document.createElement('div')

		render(class {
			getInitialState() {
				return {x: '!!'}
			}
			render(props, {x}) {
				return h('h1', 'Hello World', x)
			}
		}, container)

		assert.html(container, '<h1>Hello World!!</h1>')
	})

	it('should async getInitialState', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			getInitialState() {
				return Promise.resolve({x: '!!'})
			}
			render(props, {x}) {
				stack.push(x)
				return h('h1', 'Hello World', x)
			}
		}, container)

		nextTick(() => {
			assert.html(container, '<h1>Hello World!!</h1>')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should async mount', (done) => {
		let container = document.createElement('div')
		let refs = Promise.resolve(h('h1', 'Hello'))

		render(class {
			render() {
				return refs
			}
		}, container)

		assert.html(container, '')
		refs.then(() => assert.html(container, '<h1>Hello</h1>')).then(done)
	})

	it('should render a placeholder before async mount', (done) => {
		let container = document.createElement('div')
		let refs = Promise.resolve(h('h1', 'Hello'))

		render(class {
			render() {
				return h(refs, h('h1', 'Loading'))
			}
		}, container)

		assert.html(container, '<h1>Loading</h1>')
		refs.then(() => assert.html(container, '<h1>Hello</h1>')).then(done)
	})

	it('should async unmount', (done) => {
		let container = document.createElement('div')
		let refs = new Promise((resolve) => resolve())

		render(class {
			componentWillUnmount() {
				return refs
			}
			render() {
				return h('h1', 'Hello')
			}
		}, container)
		unmountComponentAtNode(container)

		assert.html(container, '<h1>Hello</h1>')
		refs.then(() => assert.html(container, '')).then(done)
	})
})
