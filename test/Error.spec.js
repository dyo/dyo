describe('Error', () => {
	it('should not render invalid objects', () => {
		let container = document.createElement('div')

		assert.throws(() => {
			render(h('div', null, {}), container)
		})

		assert.throws(() => {
			render(h('div', null, Object.create(null)), container)
		})

		assert.throws(() => {
			render(h('div', null, new Date()), container)
		})

		assert.throws(() => {
			render(h({}), container)
		})
	})

	it('should not render invalid primitives', () => {
		let container = document.createElement('div')

		assert.throws(() => {
			render(h(null), container)
		})

		assert.throws(() => {
			render(h(undefined), container)
		})

		assert.throws(() => {
			render(h(1), container)
		})

		assert.throws(() => {
			render(h(Symbol('foo')), container)
		})
	})

	it('should not render to an invalid container', () => {
		let container = document.createElement('div')

		assert.throws(() => {
			render('1', {})
		})
	})

	it('should catch an invalid element(string) render error', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				render() {
					return h('!invalid')
				}
			}), container)
		})

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should catch an invalid element(number) render error', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				render() {
					return h(1)
				}
			}), container)
		})

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should catch an invalid element(symbol) render error', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				render() {
					return h(Symbol('invalid.Element'))
				}
			}), container)
		})

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should unmount a corrupted element tree', (done) => {
		let container = document.createElement('div')

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class A {
				render() {
					return class B {
						render() {
							throw new Error('error!')
						}
					}
				}
			}), container)
		})

		nextTick(() => {
			assert.html(container, '')
			done()
		})
	})

	it('should unmount when an error is thrown in componentDidCatch', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {message}) {
				stack.push(message.indexOf('componentDidCatch') > -1)
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				render() {
					return class {
						componentDidCatch(err, {componentStack}) {
							throw err
						}
						render() {
							return class {
								render() {
									throw new Error('Error!')
								}
							}
						}
					}
				}
			}), container)
		})

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

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push('error')
				return {error: true}
			}
			render({children}, {error}) {
				if (error)
					return 'Hello World'

				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				render() {
					return stack.push('render') && refs
				}
			}), container)
		})

		refs.catch(() => {
			nextTick(() => {
				assert.lengthOf(stack, 2)
				assert.html(container, 'Hello World')
				done()
			}, 2)
		})
	})

	it('should pass exception object to boundary', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {error, bubbles, origin, message, componentStack}) {
				stack.push(error.constructor === Symbol && 'error')
				stack.push(typeof bubbles === 'boolean' && 'bubbles')
				stack.push(typeof origin === 'string' && 'origin')
				stack.push(typeof message === 'string' && 'message')
				stack.push(typeof componentStack === 'string' && 'componentStack')
			}
			render({children}) {
				return children
			}
		}

		render(h(ErrorBoundary, class {
			render() {
				throw Symbol('test')
			}
		}), container)

		nextTick(() => {
			assert.html(container, '')
			assert.deepEqual(stack, ['error', 'bubbles', 'origin', 'message', 'componentStack'])
			done()
		})
	})

	it('should error from setState(function)', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				componentDidMount() {
					this.setState(() => {
						throw new Error('Error!')
					})
				}
				render() {
					return 1
				}
			}), container)
		})

		nextTick(() => {
			assert.html(container, '1')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from setState(..., callback)', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				componentDidMount() {
					this.setState({}, () => {
						throw new Error('Error!')
					})
				}
				render() {
					return 1
				}
			}), container)
		})

		nextTick(() => {
			assert.html(container, '1')
			assert.lengthOf(stack, 1)
			done()
		}, 1)
	})

	it('should error from setState(promise)', (done) => {
		let container = document.createElement('div')
		let stack = []
		let refs = Promise.reject('Error!')

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				componentDidMount() {
					this.setState(refs)
				}
				render() {
					return 1
				}
			}), container)
		})

		refs.catch(() => {
			nextTick(() => {
				assert.html(container, '1')
				assert.lengthOf(stack, 1)
				done()
			})
		})
	})

	it('should error from componentWillMount', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				componentWillMount() {
					throw new Error('Error!')
				}
				render() {
					return 1
				}
			}), container)
		})

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from componentDidMount', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				componentDidMount() {
					throw new Error('Error!')
				}
				render() {
					return 1
				}
			}), container)
		})

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from componentWillUpdate', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		let A = class {
			componentWillUpdate() {
				throw new Error('Error!')
			}
			render() {
				return 1
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, A), container)
			render(h(ErrorBoundary, A), container)
		})

		nextTick(() => {
			assert.html(container, '1')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from componentWillReceiveProps', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		let A = class {
			componentWillReceiveProps() {
				throw new Error('Error!')
			}
			render() {
				return 1
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, A), container)
			render(h(ErrorBoundary, A), container)
		})

		nextTick(() => {
			assert.html(container, '1')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from shouldComponentUpdate', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		let A = class {
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

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, A), container)
			render(h(ErrorBoundary, A), container)
		})

		nextTick(() => {
			assert.html(container, '1')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from constructor', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		let A = class {
			constructor() {
				throw new Error('Error!')
			}
			render() {
				return 1
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, A), container)
		})

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should error from a ref callback', () => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				render() {
					return h('div', {
						ref: () => {throw new Error('Error!')}
					})
				}
			}), container)
		})

		assert.html(container, '<div></div>')
		assert.lengthOf(stack, 1)
	})

	it('should catch errors from custom components', () => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		let AppDrawer = function () {
			throw 'custom-component'
		}
		AppDrawer.prototype = Object.create(HTMLElement)

		render(h(ErrorBoundary, h(AppDrawer)), container)
		assert.html(container, ``)
		assert.deepEqual(stack, ['custom-component'])
	})

	it('should reject async promise element', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		render(h(ErrorBoundary, Promise.reject(h('div', 1))), container)

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 1)
			done()
		})
	})

	it('should capture errors from async generator components', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		render(h(ErrorBoundary, class {
			render() {
				return class {
				  async *render() {
				  	throw '!'
				  }
				}
			}
		}), container)

		nextTick(() => {
			assert.html(container, ``)
			assert.deepEqual(stack, ['!'])
			done()
		}, 4)
	})

	it('should recover from event triggered setState', (done) => {
		let container = document.createElement('div')
		let click = new Event('click')
		let refs = null

		class ErrorBoundary extends Component {
		  constructor(props) {
		    super(props);
		    this.state = { error: null, errorInfo: null };
		  }

		  componentDidCatch(error, errorInfo) {
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

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, h(BuggyCounter)), container)
			refs.dispatchEvent(click)
		})

		nextTick(() => {
			assert.notEqual(container, '')
			done()
		}, 2)
	})

	it('should error from an event', () => {
		let container = document.createElement('div')
		let refs = null
		let stack = []
		let defaultConsoleError = console.error

		console.error = () => {}

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		render(class {
			handleEvent(e) {
				stack.push(1)
				throw new Error('Error!')
			}
			componentDidMount(node) {
				refs = node
			}
			render() {
				return h('button', {onClick: this.handleEvent}, this.state.id)
			}
		}, container)

		document.defaultView.onerror = () => {stack.push(2)}

		refs.dispatchEvent(new Event('click'))

		console.error = defaultConsoleError
		document.defaultView.onerror = undefined

		assert.html(container, '<button></button>')
		assert.deepEqual(stack, [1, 2])
	})

	it('should propergate top-level errors', () => {
		let container = document.createElement('div')
		let stack = []
		let defaultConsoleError = console.error

		console.error = () => {}

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				throw err
			}
			render({children}) {
				return children
			}
		}

		let A = class {
			render() {
				throw 'Error'
			}
		}

		assert.throws(() => {
			render(h(ErrorBoundary, A), container)
		}, 'Error')

		console.error = defaultConsoleError

		assert.html(container, '')
	})

	it('should unmount when an error is thrown in getInitalState', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		render(h(ErrorBoundary, class {
			getInitialState() {
				throw new Error('Error!')
			}
			render() {
				return h('div', 'xxx')
			}
		}), container)

		nextTick(() => {
			assert.lengthOf(stack, 1)
			assert.html(container, '')
			done()
		}, 2)
	})

	it('should not call render after an error in getInitialState', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				componentWillUnmount() {
					stack.push(1, 2)
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
			}), container)
		})

		nextTick(() => {
			assert.lengthOf(stack, 1)
			assert.html(container, '')
			done()
		}, 2)
	})

	it('should recover from async getInitialState error', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
				return {error: true}
			}
			render({children}, {error}) {
				if (error)
					return 'Hello World'

				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				getInitialState() {
					return Promise.reject({x: '!!'})
				}
				render(props, {x, children}) {
					return stack.push(x) && h('h1', 'Hello World', x)
				}
			}), container)
		})

		nextTick(() => {
			assert.html(container, 'Hello World')
			assert.lengthOf(stack, 1)
			done()
		}, 2)
	})

	it('should error from getChildContext', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}) {
				return children
			}
		}

		let A = class {
			getChildContext() {
				throw new Error('Error!')
			}
			render() {
				return 1
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, A), container)
		})

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, A), container)
		})

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 2)
			done()
		})
	})

	it('should handle recursive errors', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}, {error}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, class {
				componentDidCatch(err, {componentStack}) {
					return stack.push(err) && {error: true}
				}
				render() {
					return class {
						render() {
							throw new Error('Error!')
						}
					}
				}
			}), container)
		})

		nextTick(() => {
			assert.html(container, '')
			assert.lengthOf(stack, 2)
			done()
		})
	})

	it('should error from async componentWillUnmount', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push(err)
			}
			render({children}, {error}) {
				return children
			}
		}

		let A = class {
			componentWillUnmount() {
				return Promise.reject('!')
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, h(A, 'Hello')), container)
			render(null, container)
		})

		nextTick(() => {
			assert.html(container, '')
			assert.deepEqual(stack, ['!'])
			done()
		})
	})

	it('should handle nested componentWillUnmount errors', (done) => {
		let container = document.createElement('div')
		let stack = []

		class ErrorBoundary {
			componentDidCatch(err, {componentStack}) {
				stack.push('ErrorBoundary componentDidCatch')
			}
			componentWillUnmount() {
				stack.push('ErrorBoundary componentWillUnmount')
			}
			render({children}) {
				return children
			}
		}

		class A {
			componentWillUnmount() {
				stack.push('A componentWillUnmount')
				throw new Error('Error!')
			}
			render(props) {
				return B
			}
		}

		class B {
			componentWillUnmount() {
				stack.push('B componentWillUnmount')
				throw new Error('Error!')
			}
			render() {
				return C
			}
		}

		class C {
			componentWillUnmount() {
				stack.push('C componentWillUnmount')
				throw new Error('Error!')
			}
			render() {
				return h('h1', 'Hello')
			}
		}

		assert.doesNotThrow(() => {
			render(h(ErrorBoundary, A), container)
			render(null, container)
		})

		assert.html(container, '')
		assert.deepEqual(stack, [
			'C componentWillUnmount',
			'ErrorBoundary componentDidCatch',
			'B componentWillUnmount',
			'ErrorBoundary componentDidCatch',
			'A componentWillUnmount',
			'ErrorBoundary componentDidCatch',
			'ErrorBoundary componentWillUnmount'
		])
		done()
	})
})
