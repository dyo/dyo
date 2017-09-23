describe('Error', () => {
	it('should catch an invalid render error', () => {
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

		assert.lengthOf(error, 1)
		assert.html(container, '')
	})

	it('should unmount a corrupted tree', () => {
		let container = document.createElement('div')

		render(class A {
			componentDidCatch(err) {
				err.preventDefault()
			}
			render() {
				return class B {
					render() {
						throw new Error('end')
					}
				}
			}
		}, container)

		assert.html(container, '')
	})

	it('should unmount when an error is thrown in componentDidCatch', () => {
		let container = document.createElement('div')
		let stack = []

		render(class {
			componentDidCatch(err) {
				err.preventDefault()
				stack.push(err.componentStack.indexOf('componentDidCatch') > -1)
			}
			render() {
				return class {
					componentDidCatch(err) {
						throw err
					}
					render() {
						throw new Error('end')
					}
				}
			}
		}, container)

		assert.html(container, '')
		assert.include(stack, true)
	})

	it('should render an error', () => {
		let container = document.createElement('div')
		let stack = []
		let error = ''

		render(class A {
			componentDidCatch(err) {
				err.preventDefault()
				return err
			}
			render() {
				throw new Error('end')
			}
		}, container)

		assert.equal(container.firstChild.nodeName.toLowerCase(), 'details')
	})

	it('shoud unmount when an error is thrown in getInitalState', (done) => {
		let container = document.createElement('div')
		let error = console.error
		console.error = () => {}

		render(class {
			componentWillUnmount() {
				console.log(1)
			}
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
			})
		})
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

	it('should unmount child components', (done) => {
		let container = document.createElement('div')
		let stack = []
		let error = console.error
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
		})
	})
})
