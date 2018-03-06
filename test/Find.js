describe('Find', () => {
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

	it('should findDOMNode from event', () => {
		let event = new Event('click')
		let node = document.createElement('div')

		Object.defineProperty(event, 'currentTarget', {value: node})

		assert.doesNotThrow(() => {
			assert.equal(findDOMNode(event), node)
		})
	})

	it('should not findDOMNode from falsey values', () => {
		assert.doesNotThrow(() => {
			assert.ok(findDOMNode(null) == null)
			assert.ok(findDOMNode(undefined) == null)
		})
	})

	it('should findDOMNode from componentWillUnmount', () => {
		let container = document.createElement('div')
		let refs = null

		render(class {
			componentWillUnmount() {
				refs = findDOMNode(this)
			}
			render() {}
		}, container)

		render(null, container)
		assert.ok(refs != null)
	})

	it('should return false findDOMNode from an pre-mounted component', () => {
		let container = document.createElement('div')
		let refs = {}

		render(class {
			componentWillMount() {
				assert.ok(findDOMNode(this) == false)
			}
			render() {}
		}, container)
	})

	it('should return false findDOMNode from an unmounted component', (done) => {
		let container = document.createElement('div')
		let refs = {}

		render(class {
			componentWillUnmount() {
				setTimeout(() => {
					assert.ok(findDOMNode(this) == false)
					done()
				}, 0)
			}
			render() {}
		}, container)

		render(null, container)
	})
})
