describe('Error', () => {
	it('should catch an invalid element(string) render error', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(err)
			}
			render() {
				return h('!invalid')
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should catch an invalid element(number) render error', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(err)
			}
			render() {
				return h(1)
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should catch an invalid element(symbol) render error', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(err)
			}
			render() {
				return h(Symbol('invalid.Element'))
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should unmount a corrupted element tree', (done) => {
		let container = document.createElement('div')

		render(class A {
			componentDidCatch(err) {
				err.preventDefault()
			}
			render() {
				return class B {
					render() {
						throw new Error('error!')
					}
				}
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			done()
		})
	})

	it('should unmount when an error is thrown in componentDidCatch', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err, {errorMessage}) {
				err.preventDefault()
				stack.push(errorMessage.indexOf('componentDidCatch') > -1)
			}
			render() {
				return class {
					componentDidCatch(err) {
						throw err
					}
					render() {
						throw new Error('Error!')
					}
				}
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.include(stack, true)
			done()
		})
	})

	it('should recover from an async element error', (done) => {
		let container = document.createElement('div')
		let stack = []
		let refs = Promise.reject('')

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push('error')
				return {children: 'Hello World'}
			}
			render(props, {children}) {
				if (children)
					return children

				stack.push('render')
				return refs
			}
		}, container)

		refs.catch(() => {
			nextTick(() => {
				assert.lengthOf(stack, 2)
				assert.html(container, 'Hello World')
				done()
			}, 2)
		})
	})

	it('shoud unmount when an error is thrown in getInitalState', (done) => {
		let container = document.createElement('div')
		let error = console.error
		console.error = () => {}

		render(class {
			getInitialState() {
				throw new Error('Error!')
			}
			render() {
				return h('div', 'xxx')
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			console.error = error
			done()
		}, 2)
	})

	it('should recover from async getInitialState error', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err) {
				stack.push(err)
				err.preventDefault()
				return {children: 'Hello World'}
			}
			getInitialState() {
				return Promise.reject({x: '!!'})
			}
			render(props, {x, children}) {
				if (children)
					return children

				stack.push(x)
				return h('h1', 'Hello World', x)
			}
		}, container)

		nextTick(() => {
			assert.html(container, 'Hello World')
			assert.lengthOf(stack, 1)
			done()
		}, 2)
	})

	it('should unmount child components from an error in getInitialState', (done) => {
		let container = document.createElement('div')
		let stack = []
		let error = console.log
		console.error = () => {}

		render(class {
			componentWillUnmount() {
				stack.push(1)
			}
			getInitialState() {
				throw new Error('Error!')
			}
			render() {
				return class {
					componentWillUnmount() {
						stack.push(1)
					}
					render() {
						return h('div', 'xxx')
					}
				}
			}
		}, container)

		nextTick(() => {
			assert.lengthOf(stack, 1)
			assert.html(container, '')
			console.error = error
			done()
		}, 2)
	})

	it('should recover from setState', (done) => {
		let container = document.createElement('div')
		let click = new Event('click')
		let refs = null

		class ErrorBoundary extends Component {
		  constructor(props) {
		    super(props);
		    this.state = { error: null, errorInfo: null };
		  }

		  componentDidCatch(error, errorInfo) {
		  	error.preventDefault()
		    this.setState({
		      error: error,
		      errorInfo: errorInfo
		    })
		  }

		  render() {
		    if (this.state.errorInfo) {
		      return (
		      	h('div',
		      		h('h2', 'Someting went wrong'),
		      		h('details', {style: {whiteSpace: 'pre-wrap'}},
		      			this.state.error && this.state.error.toString(),
		      			h('br'),
		      			this.state.errorInfo.componentStack
		      		)
		      	)
		      );
		    }
		    return this.props.children
		  }
		}

		class BuggyCounter extends Component {
		  constructor(props) {
		    super(props);
		    this.state = { counter: 0 };
		    this.handleClick = this.handleClick.bind(this);
		  }

		  handleClick() {
		    this.setState(({counter}) => ({
		      counter: counter + 1
		    }));
		  }

		  render() {
		    if (this.state.counter !== 0) {
		      throw new Error('I crashed!');
		    }
		    return h('h1', {onClick: this.handleClick, ref: (value) => refs = value}, this.state.counter)
		  }
		}

		render(h(ErrorBoundary, h(BuggyCounter)), container)
		refs.dispatchEvent(click)

		nextTick(() => {
			assert.notEqual(container, '')
			done()
		}, 2)
	})

	it('should pass errorMessage to boundary', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err, {errorMessage}) {
				err.preventDefault()
				stack.push(typeof errorMessage === 'string')
			}
			render() {
				throw new Error('Error!')
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.include(stack, true)
			done()
		})
	})

	it('should pass errorLocation to boundary', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err, {errorLocation}) {
				err.preventDefault()
				stack.push(errorLocation === 'render')
			}
			render() {
				throw new Error('Error!')
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.include(stack, true)
			done()
		})
	})

	it('should pass componentStack to boundary', (done) => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err, {componentStack}) {
				err.preventDefault()
				stack.push(typeof componentStack === 'string')
			}
			render() {
				throw new Error('Error!')
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.include(stack, true)
			done()
		})
	})

	it('should handle recursive errors', (done) => {
		let container = document.createElement('div')
		let stack = []
		let count = 0
		let error = console.error
		let spy = console.error = () => { count++ }

		render(class {
			componentDidCatch(err) {
				stack.push(true)
			}
			render() {
				return class {
					componentDidCatch(err, {componentStack}) {
						return {error: true}
					}
					render() {
						if (this.state.error)
							stack.push(true)

						throw new Error('Error!')
					}
				}
			}
		}, container)

		nextTick(() => {
			assert.html(container, '')
			assert.include(stack, true)
			assert.lengthOf(stack, 2)
			assert.equal(count, 2)

			console.error = error
			done()
		})
	})

	it('should handle nested componentWillUnmount errors', (done) => {
		let container = document.createElement('div')
		let stack = []
		let error = console.error

		console.error = () => {}

		class A {
			componentDidCatch(err) {
				err.preventDefault()
				this.setState({error: true})
				stack.push('componentDidCatch')
			}
			componentWillUnmount() {
				stack.push('A componentWillUnmount')
			}
			render(props) {
				return class B {
					componentWillUnmount() {
						stack.push('B componentWillUnmount')
						throw new Error('Error!')
					}
					render() {
						return class C {
							componentWillUnmount() {
								stack.push('C componentWillUnmount')
								throw new Error('Error!')
							}
							render() {
								return h('h1', 'Hello')
							}
						}
					}
				}
			}
		}

		render(A, container)
		render(null, container)

		assert.html(container, '')
		assert.deepEqual(stack, [
			'C componentWillUnmount',
			'componentDidCatch',
			'B componentWillUnmount',
			'A componentWillUnmount'
		])

		console.error = error
		done()
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

	it('should error from setState(..., callback)', (done) => {
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
})
