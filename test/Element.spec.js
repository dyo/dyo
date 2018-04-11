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
		assert.equal(cloneElement(h('h1', {className: 'head'}), {className: 'change'}).props.className, 'change')
		assert.equal(cloneElement(h('h1', {ref: 'ref'})).ref, 'ref')
		assert.equal(cloneElement(h('h1', {xmlns: 'xmlns'})).xmlns, 'xmlns')
		assert.equal(cloneElement(h('h1', {key: 'key'})).key, 'key')

		assert.deepEqual(cloneElement(h(() => {}, {ref: 'ref'}, 1, 2)).props, {ref: 'ref', children: [1, 2]})
	})

	it('should not clone an invalid element', () => {
		let element = {type: 'h1', props: {className: 'head'}, children: []}
		assert.equal(cloneElement(element), undefined)
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

	it('should create an element with xmlns namespace', () => {
		assert.equal(h('h1', {xmlns: 'bar'}).xmlns, 'bar')
	})

	it('should create an element with children', () => {
		assert.equal(h('div', [1, 2], 3, h('h1')).children.length, 4)
	})

	it('should assign children to a component element', () => {
		assert.deepEqual(h(() => {}, 1, 2).props.children, [1, 2])
	})

	it('should assign opaque children to a component element', () => {
		assert.equal(h(() => {}, 1).props.children, 1)
	})

	it('should not assign children to a component element', () => {
		assert.isFalse(Array.isArray(h(() => {}).props.children))
	})

	it('should assign props to a component element', () => {
		assert.equal(h(() => {}, {id: 1}).props.id, 1)
	})

	it('should assign props as a non-pojo object', () => {
		let props = new (function () { this.id = 1 })
		assert.equal(h('h1', props).props.id, 1)
	})

	it('should assign props as an object with an empty prototype', () => {
		let props = Object.create(null, {id: {value: 1}})
		assert.equal(h('h1', props).props.id, 1)
	})

	it('should assign array children', () => {
		assert.lengthOf(h('h1', [1, 2]).children, 2)
	})

	it('should assign nested array children', () => {
		assert.lengthOf(h('h1', [1, 2, [3, 4]]).children, 4)
	})

	it('should assign multiple array children', () => {
		assert.lengthOf(h('h1', [1, 2], [1, 2]).children, 4)
	})

	it('should assign multiple nested array children', () => {
		assert.lengthOf(h('h1', [1, 2, [3, 4]], [1, 2, [3, 4]]).children, 8)
	})

	it('should assign an empty props object', () => {
		assert.deepEqual(h('h1').props, {})
		assert.deepEqual(h('h1', null).props, {})
		assert.deepEqual(h('h1', []).props, {})
		assert.deepEqual(h('h1', h('h1')).props, {})
		assert.deepEqual(h('h1', 1).props, {})
		assert.deepEqual(h('h1', '').props, {})
		assert.deepEqual(h('h1', () => {}).props, {})
	})

	it('should not assign element as props', () => {
		assert.doesNotHaveAnyKeys(h('div', h('h1')).props, ['type', 'props', 'children'])
	})

	it('should not assign an array as props', () => {
		let mock = Object.defineProperty([1, 2, 3], Symbol.iterator, {value: undefined})

		assert.equal(mock[Symbol.iterator], undefined)

		let element = h('div', mock)

		assert.deepEqual(element.props, {})
		assert.lengthOf(element.children, 3)
	})
})
