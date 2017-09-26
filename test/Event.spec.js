describe('Event', () => {
	it('should dispatch EventListener events', () => {
		let container = document.createElement('div')
		let event = []
		let refs = null

		render(class {
			handleEvent(e) {
				event.push(e)
			}
			componentDidMount(node) {
				refs = node
			}
			render() {
				return h('button', {onClick: this})
			}
		}, container)

		refs.dispatchEvent(new Event('click'))
		assert.lengthOf(event, 1)
	})

	it('should dispatch function events', () => {
		let container = document.createElement('div')
		let event = []
		let refs = null

		render(class {
			handleEvent(e) {
				event.push(e)
			}
			componentDidMount(node) {
				refs = node
			}
			render() {
				return h('button', {onMouseDown: this.handleEvent})
			}
		}, container)

		refs.dispatchEvent(new Event('mousedown'))
		assert.lengthOf(event, 1)
	})

	it('should dispatch multiple events', () => {
		let container = document.createElement('div')
		let event = []
		let refs = null
		
		render(class {
			handleEvent(e) {
				event.push(e)
			}
			componentDidMount(node) {
				refs = node
			}
			render() {
				return h('button', {onClick: this, onMouseDown: this.handleEvent})
			}
		}, container)

		refs.dispatchEvent(new Event('click'))
		refs.dispatchEvent(new Event('mousedown'))
		assert.lengthOf(event, 2)
	})
})
