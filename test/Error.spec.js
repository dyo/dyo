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
})
