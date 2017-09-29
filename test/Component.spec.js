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
			shouldComponentUpdate() { return !!stack.push('shouldComponentUpdate') }
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
		A.shouldComponentUpdate = () => { return !!stack.push('shouldComponentUpdate') }
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

	it('should always set an object as context', () => {
		let container = document.createElement('div')
		let stack = []
		let A = class {
			getChildContext() {
				
			}
			render() {
				return class {
					render() {
						return class {
							render(props, state, {children}) {
								return class {
									render(props, state, context) {
										stack.push(context != null)
									}
								}
							}
						}
					}
				}
			}
		}

		render(h('div', A), container)

		assert.html(container, '<div></div>')
		assert.include(stack, true)
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

		render(h(A, {children: 1, new: true}), container)
		render(h(A, {children: 1}), container)

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

	it('should update PureComponent with -0', () => {
		let container = document.createElement('div')
		let A = class extends PureComponent {
			render () {
				return ++counter
			}
		}

		let counter = 0

		render(h(A, {children: 0}), container)
		render(h(A, {children: -0}), container)

		assert.html(container, '2')
	})

	it('should not update PureComponent with NaN', () => {
		let container = document.createElement('div')
		let A = class extends PureComponent {
			render () {
				return ++counter
			}
		}

		let counter = 0

		render(h(A, {children: NaN}), container)
		render(h(A, {children: NaN}), container)

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

	it('should render defaultProps(object)', () => {
		let container = document.createElement('div')
		class A {
			render() {
				return this.props.children
			}
		}
		A.defaultProps = {children: 1}

		render(A, container)
		assert.html(container, '1')
	})

	it('should render defaultProps(function)', () => {
		let container = document.createElement('div')
		class A {
			static defaultProps() {
				return {children: 2}
			}
			render() {
				return this.props.children
			}
		}

		render(A, container)
		assert.html(container, '2')
	})

	it('should update component ref', () => {
		let container = document.createElement('div')
		let stack = []
		let refs = null

		class A {
			componentWillMount() {
				refs = this
			}
			render() {
				return 'Hello'
			}
		}

		render(h(A, {ref: (value) => stack.push(value)}), container)
		render(h(A, {ref: (value) => stack.push(value)}), container)
		assert.html(container, 'Hello')
		assert.include(stack, null)
		assert.include(stack, refs)
	})

	it('should not update component ref', () => {
		let container = document.createElement('div')
		let stack = []
		let refs = (value) => stack.push(value)

		class A {
			render() {
				return 'Hello'
			}
		}

		render(h(A, {ref: refs}), container)
		render(h(A, {ref: refs}), container)
		assert.html(container, 'Hello')
		assert.lengthOf(stack, 1)
	})

	it('should pass multiple children to component', () => {
		let container = document.createElement('div')
		let refs = null

		render(h(class {
			render() {
				refs = this.props.children
			}
		}, 1, 2, [3, 4]), container)

		assert.lengthOf(refs, 3)
	})

	it('should render a generator(iterator)', () => {
		let container = document.createElement('div')

		render(class {
			*render() {
				yield 1
				yield 2
				yield 3
			}
		}, container)

		assert.html(container, '123')
	})

	it('should render a generator(function)', () => {
		let container = document.createElement('div')
		
		render(h('div', function *render() {yield 1}), container)

		assert.html(container, '<div>1</div>')
	})

	it('should setState in constructor', (done) => {
		let container = document.createElement('div')

		render(class {
			constructor() {
				this.setState({id: 1})
			}
			render () {
				return this.state.id
			}
		}, container)

		nextTick(() => {
			assert.html(container, '1')
			done()
		})
	})

	it('should forceUpdate in constructor', (done) => {
		let container = document.createElement('div')
		let counter = 0

		render(class {
			constructor() {
				counter++
				this.forceUpdate()
			}
			render () {
				return counter
			}
		}, container)

		nextTick(() => {
			assert.html(container, '1')
			done()
		})
	})

	it('should setState in componentWillMount', () => {
		let container = document.createElement('div')

		render(class {
			componentWillMount() {
				this.setState({id: 1})
			}
			render () {
				return this.state.id
			}
		}, container)

		assert.html(container, '1')
	})

	it('should not setState null', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			getInitialState() {
				return {
					id: 1
				}
			}
			componentDidMount() {
				this.setState(null)
			}
			render () {
				stack.push(1)
				return this.state.id
			}
		}, container)

		nextTick(() => {
			assert.lengthOf(stack, 1)
			assert.html(container, '1')
			done()
		})
	})

	it('should not implicit setState null', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidMount() {
				return null
			}
			render () {
				stack.push(1)
				return this.state.id
			}
		}, container)

		nextTick(() => {
			assert.lengthOf(stack, 1)
			assert.html(container, '')
			done()
		})
	})

	it('should trigger an implicit setState from an event', () => {
		let container = document.createElement('div')
		let event = []
		let refs = null

		render(class {
			handleEvent(e) {
				return {id: 1}
			}
			componentDidMount(node) {
				refs = node
			}
			render() {
				return h('button', {onClick: this.handleEvent}, this.state.id)
			}
		}, container)

		refs.dispatchEvent(new Event('click'))
		assert.html(container, '<button>1</button>')
	})

	it('should error from an event', () => {
		let container = document.createElement('div')
		let refs = null
		let stack = []
		let error = console.error
		let spy = console.error = () => stack.push(1)

		render(class {
			handleEvent(e) {
				throw new Error('Error!')
			}
			componentDidMount(node) {
				refs = node
			}
			render() {
				return h('button', {onClick: this.handleEvent}, this.state.id)
			}
		}, container)

		refs.dispatchEvent(new Event('click'))
		
		assert.html(container, '<button></button>')
		assert.lengthOf(stack, 1)
		console.error = error
	})

	it('should error from setState(function)', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(1)
			}
			componentDidMount() {
				this.setState(() => {
					throw new Error('Error!')
				})
			}
			render() {
				return 1
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from setState(callback)', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(1)
			}
			componentDidMount() {
				this.setState({}, () => {
					throw new Error('Error!')
				})
			}
			render() {
				return 1
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		}, 1)
	})

	it('should error from setState(promise)', (done) => {
		let container = document.createElement('div')
		let stack = []
		let refs = Promise.reject('Error!')

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(1)
			}
			componentDidMount() {
				this.setState(refs)
			}
			render() {
				return 1
			}
		}, container)

		refs.catch(() => {
			nextTick(() => {
				assert.html(container, '')
				assert.lengthOf(stack, 1)
				done()
			})
		})
	})

	it('should error from componentWillMount', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(1)
			}
			componentWillMount() {
				throw new Error('Error!')
			}
			render() {
				return 1
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from componentDidMount', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(1)
			}
			componentDidMount() {
				throw new Error('Error!')
			}
			render() {
				return 1
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from componentWillUpdate', (done) => {
		let container = document.createElement('div')
		let stack = []
		let A = class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(1)
			}
			componentWillUpdate() {
				throw new Error('Error!')
			}
			render() {
				return 1
			}
		}

		render(A, container)
		render(A, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from componentWillReceiveProps', (done) => {
		let container = document.createElement('div')
		let stack = []
		let A = class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(1)
			}
			componentWillReceiveProps() {
				throw new Error('Error!')
			}
			render() {
				return 1
			}
		}

		render(A, container)
		render(A, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from shouldComponentUpdate', (done) => {
		let container = document.createElement('div')
		let stack = []
		let A = class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(1)
			}
			shouldComponentUpdate() {
				throw new Error('Error!')
			}
			componentDidUpdate() {
				stack.push('should not push')
			}
			render() {
				return 1
			}
		}

		render(A, container)
		render(A, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from constructor', (done) => {
		let container = document.createElement('div')
		let stack = []
		let A = class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(1)
			}
			render() {
				return B
			}
		}
		let B = class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(2)
			}
			constructor() {
				throw new Error('Error!')
			}
			render() {
				return 1
			}
		}

		render(A, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from a ref callback', () => {
		let container = document.createElement('div')
		let stack = []
		let error = console.error
		let spy = console.error = () => stack.push(1)

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push('should not push')
			}
			render() {
				return h('div', {
					ref: () => {throw new Error('Error!')}
				})
			}
		}, container)

		assert.html(container, '<div></div>')
		assert.lengthOf(stack, 1)
		console.error = error
	})

	it('should update a promise element', (done) => {
		let container = document.createElement('div')
		let A = class {
			render({children}) {
				return children
			}
		}

		render(h(A, Promise.resolve(h('div', 1))), container)
		render(h(A, Promise.resolve(h('div', 2))), container)

		nextTick(() => {
			assert.html(container, '<div>2</div>')
			done()
		})
	})

	it('should reject async promise element', (done) => {
		let container = document.createElement('div')
		let stack = []
		let A = class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(1)
			}
			render({children}) {
				return children
			}
		}

		render(h(A, Promise.reject(h('div', 1))), container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should throw in async unmount', (done) => {
		let container = document.createElement('div')
		let stack = []
		let error = console.error
		let spy = console.error = () => stack.push(1)

		let A = class {
			componentWillUnmount() {
				return Promise.reject()
			}
			render({children}) {
				return children
			}
		}

		render(h(A), container)
		render(null, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should ensure a pending component update is resolved', (done) => {
		let container = document.createElement('div')
		let stack = []
		let A = class {
			componentDidCatch(err) {
				err.preventDefault()
			}
			componentDidMount() {
				render(h(A, 2), container)

				nextTick(() => {
					assert.html(container, '2')
					assert.lengthOf(stack, 2)
					done()
				})
			}
			render({children}, {name}) {
				stack.push(1)
				return children
			}
		}

		render(h(A, 1), container)
	})

	it('should should remove a component from a list of host elements', () => {
		let container = document.createElement('div')
		let A = () => h('h1', 'A')

		render(
			h('div',
				h(A, {key: 'A'}),
				h('div', {key: 'B'}, 'B')
			),
			container
		)

		render(
			h('div', 
				h('div', {key: 'B'}, 'B')
			),
			container
		)

		assert.html(container, `
			<div>
				<div>B</div>
			</div>
		`)
	})

	it('should replace async mount before resolve', (done) => {
		let container = document.createElement('div')
		let refs = Promise.resolve(h('h1', 'Hello'))

		render(class {
			render() {
				return refs
			}
		}, container)
		render(h('div'), container)

		assert.html(container, '<div></div>')
		refs.then(() => assert.html(container, '<div></div>')).then(done)
	})

	it('should call setState(callback)', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidMount() {
				this.setState({}, () => {
					stack.push(true)
				})
			}
			render() {
				return 1
			}
		}, container)

		nextTick(() => {
			assert.html(container, '1')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should call forceUpdate(callback)', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidMount() {
				this.forceUpdate(() => {
					stack.push(true)
				})
			}
			render() {
				return 1
			}
		}, container)

		nextTick(() => {
			assert.html(container, '1')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should not call setState(callback)', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidMount() {
				this.setState({}, 'should not throw')
			}
			render() {
				return 1
			}
		}, container)

		nextTick(() => {
			assert.html(container, '1')
			assert.lengthOf(stack, 0)
			done()
		})
	})
})
