describe('Element', () => {
	it('should validate an element', () => {
		assert.isTrue(isValidElement(h('div')))
	})

	it('should not validate a non-element', () => {
		assert.isFalse(isValidElement('div'))
		assert.isFalse(isValidElement(1))
		assert.isFalse(isValidElement(function () {}))
		assert.isFalse(isValidElement({}))
		assert.isFalse(isValidElement(Object.assign({}, h('div'))))
	})

	it('should clone an element', () => {
		assert.equal(cloneElement(h('h1', {className: 'head'})).props.className, 'head')
	})

	it('should create an element', () => {
		assert.equal(h('h1', 'Hello World').type, 'h1')
	})

	it('should create an element with a key', () => {
		assert.equal(h('h1', {key: 'bar'}).key, 'bar')
	})

	it('should create an element with a ref', () => {
		assert.equal(h('h1', {ref: 'bar'}).ref, 'bar')
	})

	it('should create an element with an xmlns', () => {
		assert.equal(h('h1', {xmlns: 'bar'}).xmlns, 'bar')
	})

	it('should create an element with children', () => {
		assert.equal(h('div', [1, 2], 3, h('h1')).children.length, 4)
	})
})
