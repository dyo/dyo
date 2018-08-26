import {cloneElement, isValidElement, createElement, h} from 'dio'

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
		assert.deepEqual(cloneElement(h('h1', {className: 'head'})).props, {className: 'head'})
		assert.deepEqual(cloneElement(h('h1', {className: 'head'}), {className: 'change'}).props, {className: 'change'})
		assert.deepEqual(cloneElement(h('h1', {ref: 'ref'})).ref, 'ref')
		assert.deepEqual(cloneElement(h('h1', {xmlns: 'xmlns'})).props, {xmlns: 'xmlns'})
		assert.deepEqual(cloneElement(h('h1', {key: 'key'})).props, {key: 'key'})
		assert.deepEqual(cloneElement(h(() => {}, {ref: 'ref'}, 1, 2)).props, {ref: 'ref', children: [1, 2]})
	})

	it('should create an element', () => {
		assert.deepEqual(h('h1', 'Hello World').type, 'h1')
	})

	it('should create an element with a key', () => {
		assert.deepEqual(h('h1', {key: 'bar'}).key, 'bar')
	})

	it('should create an element with children', () => {
		assert.deepEqual(h('div', [1, 2], 3, h('h1')).children.length, 4)
	})

	it('should assign children to a component element', () => {
		assert.deepEqual(h(() => {}, 1, 2).props.children, [1, 2])
	})

	it('should assign opaque children to a component element', () => {
		assert.deepEqual(h(() => {}, 1).props.children, 1)
	})

	it('should not assign children to a component element', () => {
		assert.isFalse(Array.isArray(h(() => {}).props.children))
	})

	it('should assign props to a component element', () => {
		assert.deepEqual(h(() => {}, {id: 1}).props, {id: 1})
	})

	it('should assign props as a non-pojo object', () => {
		assert.deepEqual(h('h1', new (function () { this.id = 1 })).props, {id: 1})
	})

	it('should assign props as an object with an empty prototype', () => {
		assert.deepEqual(h('h1', Object.create(null, {id: {value: 1}})).props, {id: 1})
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
		assert.deepEqual(h('div', Object.defineProperty([1, 2, 3], Symbol.iterator, {value: undefined})), h('div', {}, [1, 2, 3]))
	})

	it('should share createElement and h identity', () => {
		assert.isTrue(h === createElement)
	})
})
