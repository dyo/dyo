describe('Async', () => {
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

	it('should render and async mount', (done) => {
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
