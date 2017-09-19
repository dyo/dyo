describe('Event', () => {
	let container = document.createElement('div')
	let mousedown = new Event('mousedown')
	let click = new Event('click')

	it('should dispatch EventListener events', () => {
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

		refs.dispatchEvent(click)
		assert.lengthOf(event, 1)
	})

	it('should dispatch function events', () => {
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

		refs.dispatchEvent(mousedown)
		assert.lengthOf(event, 1)
	})

	it('should dispatch multiple events', () => {
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

		refs.dispatchEvent(click)
		refs.dispatchEvent(mousedown)
		assert.lengthOf(event, 2)
	})
})
