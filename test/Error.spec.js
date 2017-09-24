describe('Error', () => {
	it('should catch an invalid render error', (done) => {
		let container = document.createElement('div')
		let error = []

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				error.push(err)
			}
			render() {
				return h('!invalid')
			}
		}, container)

		nextTick(() => {
			assert.lengthOf(error, 1)
			assert.html(container, '')
			done()
		})
	})

	it('should unmount a corrupted tree', (done) => {
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
				return 'Hello World'
			}
			render(props, state) {
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

	it('should recover from an async component stream error', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})

		let element = h(class {
			componentDidCatch(err) {
				err.preventDefault()
				return h('h1', 'Error!')
			}
			getInitialState() {
				return Promise.reject({x: '!'})
			}
			render(props, {x}) {
				return h('h1', 'Hello World', x)
			}
		})
		let output = ''

		renderToStream(element, writable, () => {
			assert.html(output, '<h1>Error!</h1>')
			done()
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
				return 'Hello World'
			}
			getInitialState() {
				return Promise.reject({x: '!!'})
			}
			render(props, {x}) {
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

	it('should recover through setState', (done) => {
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

	it('should propagate errors on the server', (done) => {
		let A = () => { throw new Error('x') }
		let error = null

		assert.html(h(class {
			componentDidCatch(err) {
				err.preventDefault()
				error = err
			}
			render () {
				return h('div', A)
			}
		}), '<div></div>')

		nextTick(() => {
			assert.instanceOf(error, Error)
			done()
		})
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
})
