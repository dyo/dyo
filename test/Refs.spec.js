describe('Refs', () => {
	it('should (un)mount component ref function', () => {
		let container = document.createElement('div')
		let refs = null
		let A = class {
			render() {
				return null
			}
		}

		render(class {
			render() {
				return h(A, {ref: (value) => refs = value})
			}
		}, container)
		assert.instanceOf(refs, A, 'ref function(instance#mount)')

		unmountComponentAtNode(container)
		assert.equal(refs, null, 'ref function(instance#unmount)')
	})

	it('should (un)mount component ref string', () => {
		let container = document.createElement('div')
		let refs = null
		let A = class {
			render() {
				return null
			}
		}

		render(class {
			componentDidMount() {
				refs = this.refs
			}
			render() {
				return h(A, {ref: 'instance'})
			}
		}, container)
		assert.instanceOf(refs.instance, A, 'ref string(instance#mount)')

		unmountComponentAtNode(container)
		assert.equal(refs.instance, null, 'ref string(node#unmount)')
	})

	it('should not mount component ref string without an host owner', () => {
		let container = document.createElement('div')
		let refs = null
		let A = class {
			render() {
				return null
			}
		}

		assert.doesNotThrow(() => {
			render(h(A, {ref: 'instance'}), container)
			unmountComponentAtNode(container)
		})
	})

	it('should update component ref function', () => {
		let container = document.createElement('div')
		let stack = []
		let refs = null

		class A {
			componentWillMount() {
				refs = this
			}
			render() {
				return 'Hello'
			}
		}

		render(h(A, {ref: (value) => stack.push(value)}), container)
		render(h(A, {ref: (value) => stack.push(value)}), container)
		assert.html(container, 'Hello')
		assert.include(stack, null)
		assert.include(stack, refs)
	})

	it('should not update component ref function', () => {
		let container = document.createElement('div')
		let stack = []
		let refs = (value) => stack.push(value)

		class A {
			render() {
				return 'Hello'
			}
		}

		render(h(A, {ref: refs}), container)
		render(h(A, {ref: refs}), container)
		assert.html(container, 'Hello')
		assert.lengthOf(stack, 1)
	})

	it('should invoke component refs after componentDidMount', () => {
		let container = document.createElement('div')
		let stack = []

		class A {
			componentDidMount() {
				stack.push('componentDidMount')
			}
			render() {
				return 'Hello'
			}
		}

		render(h(A, {ref: () => stack.push('ref')}), container)

		assert.html(container, 'Hello')
		assert.deepEqual(stack, ['componentDidMount', 'ref'])
	})

	it('should update component refs after componentDidUpdate', () => {
		let container = document.createElement('div')
		let stack = []

		class A {
			componentDidUpdate() {
				stack.push('componentDidUpdate')
			}
			render() {
				return 'Hello'
			}
		}

		render(h(A), container)
		render(h(A, {ref: () => stack.push('ref')}), container)

		assert.html(container, 'Hello')
		assert.deepEqual(stack, ['componentDidUpdate', 'ref'])
	})

	it('should (un)mount object refs', () => {
		let container = document.createElement('div')
		let refs = {current: null}

		render(h('h1', {ref: refs}), container)
		assert.notEqual(refs.current, null)
		assert.equal(refs.current.nodeName, 'H1')

		unmountComponentAtNode(container)
		assert.equal(refs.current, null)
	})

	it('should (un)mount element refs', () => {
		let container = document.createElement('div')
		let refs = null

		render(h('h1', {ref: (value) => refs = value}), container)
		assert.notEqual(refs, null)
		assert.equal(refs.nodeName, 'H1')

		unmountComponentAtNode(container)
		assert.equal(refs, null)
	})

	it('should update element refs', () => {
		let container = document.createElement('div')
		let refs = null
		let stack = []

		render(h('h1', {ref: (value) => {
			if (refs = value)
				stack.push('mount 1')
			else
				stack.push('unmount 1')
		}}), container)
		assert.notEqual(refs, null)
		assert.equal(refs.nodeName, 'H1')

		render(h('h1', {ref: (value) => {
			if (refs = value)
				stack.push('mount 2')
			else
				stack.push('unmount 2')
		}}), container)
		assert.notEqual(refs, null)
		assert.equal(refs.nodeName, 'H1')

		unmountComponentAtNode(container)
		assert.deepEqual(stack, ['mount 1', 'unmount 1', 'mount 2', 'unmount 2'])
	})

	it('should unmount undefined element refs', () => {
		let container = document.createElement('div')
		let refs = undefined

		render(h('h1', {ref: (value) => refs = value}), container)
		render(h('h1', {ref: undefined}), container)
		assert.equal(refs, null)
	})

	it('should unmount null element refs', () => {
		let container = document.createElement('div')
		let refs = undefined

		render(h('h1', {ref: (value) => refs = value}), container)
		render(h('h1', {ref: null}), container)
		assert.equal(refs, null)
	})

	it('should handle invalid element refs', () => {
		let container = document.createElement('div')

		assert.doesNotThrow(() => {
			render(h('div', {ref: null}), container)
			render(h('div', {ref: undefined}), container)
			render(h('div', {ref: 100}), container)
			render(h('div', {ref: Symbol('')}), container)
			render(h('div', {ref: {}}), container)
		})
	})

	it('should throw in element refs', () => {
		let container = document.createElement('div')

		assert.throws(() => {
			render(h('div', {ref: () => {throw 'error!'}}), container)
		}, 'error!')
	})
})
