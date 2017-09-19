describe('Error', () => {
	let container = document.createElement('div')

	it('should catch an invalid render error', () => {
		let error = []

		render(class {
			componentDidCatch(e) {
				e.report = void error.push(e)
			}
			render() {
				return h('!invalid')
			}
		}, container)

		assert.lengthOf(error, 1)
		assert.html(container, '')
	})
})
