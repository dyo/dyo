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

	it('should replace event', () => {
		let container = document.createElement('div')
		let event = []
		let refs = null

		render(h('div', {onClick: () => event.push(1), ref: (value) => refs = value}), container)
		refs.dispatchEvent(new Event('click'))
		assert.lengthOf(event, 1)
		assert.include(event, 1)

		render(h('div', {onClick: () => event.push(2), ref: (value) => refs = value}), container)
		refs.dispatchEvent(new Event('click'))
		assert.lengthOf(event, 2)
		assert.include(event, 2)
	})

	it('should remove event', () => {
		let container = document.createElement('div')
		let event = []
		let refs = null

		render(h('div', {onClick: () => event.push(1), ref: (value) => refs = value}), container)
		refs.dispatchEvent(new Event('click'))

		render(h('div', {ref: (value) => refs = value}), container)
		refs.dispatchEvent(new Event('click'))
		assert.include(event, 1)
		assert.include(event, 1)
	})

	it('should not trigger invalid event', () => {
		let container = document.createElement('div')
		let event = []
		let refs = null
		let element = h('div', {onClick: () => event.push(1)})

		render(element, container)
		render(h('div', {onClick: 'invalid event', ref: (value) => refs = value}), container)

		assert.doesNotThrow(() => {
			refs.dispatchEvent(new Event('click'))
			assert.lengthOf(event, 0)
		})
	})
})
