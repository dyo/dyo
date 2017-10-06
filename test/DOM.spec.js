describe('DOM', () => {
	it('should findDOMNode from component', () => {
		let container = document.createElement('div')
		let refs = null

		render(class {
			componentDidMount() {
				refs = findDOMNode(this)
			}
			render() {
				return h('div', h('span', 1))
			}
		}, container)

		assert.html(refs, '<span>1</span>')
	})

	it('should findDOMNode from element', () => {
		let container = document.createElement('div')
		let refs = null
		let element = null

		render(class {
			componentDidMount() {
				refs = findDOMNode(element)
			}
			render() {
				return element = h('div', h('span', 1))
			}
		}, container)

		assert.html(refs, '<span>1</span>')
	})

	it('should findDOMNode from DOM node', () => {
		let container = document.createElement('div')
		let refs = null

		render(class {
			componentDidMount(node) {
				refs = findDOMNode(node)
			}
			render() {
				return h('div', h('span', 1))
			}
		}, container)

		assert.html(refs, '<span>1</span>')
	})

	it('should not findDOMNode from falsey value', () => {
		assert.throws(() => {
			findDOMNode(null)
		})
	})

	it('should not findDOMNode from unmount component', () => {
		assert.throws(() => {
			findDOMNode(h('div'))
		})
	})

	it('should findDOMNode from event', () => {
		let event = new Event('click')
		let node = document.createElement('div')

		Object.defineProperty(event, 'currentTarget', {value: node})

		assert.doesNotThrow(() => {
			assert.equal(findDOMNode(event), node)
		})
	})
})
