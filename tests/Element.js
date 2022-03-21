import {h, createElement, cloneElement, isValidElement} from '../index.js'

describe('Element', () => {
	it('should create an element', () => {
		assert.deepEqual(h('h1', 'Hello World').type, 'h1')
		assert.deepEqual(h('h1', 'Hello World').props, {})
		assert.lengthOf(h('h1', 'Hello World').children, 1)
	})

	it('should create an element with children', () => {
		assert.deepEqual(h('div', {}, [1, 2], 3, h('h1')).children.length, 3)
	})

	it('should assign children to a component element', () => {
		assert.deepEqual(h(() => {}, {}, [1, 2]).props.children, [1, 2])
	})

	it('should assign opaque children to a component element', () => {
		assert.deepEqual(h(() => {}, {}, 1).props.children, 1)
	})

	it('should not assign children to a component element', () => {
		assert.deepEqual(h(() => {}).props.children, undefined)
	})

	it('should assign props to a component element', () => {
		assert.deepEqual(h(() => {}, {id: 1}).props, {id: 1})
	})

	it('should symlink "h" to "createElement"', () => {
		assert.deepEqual(createElement, h)
	})

	it('should assign array children', () => {
		assert.lengthOf(h('h1', {}, [1, 2]).children, 1)
	})

	it('should assign nested array children', () => {
		assert.lengthOf(h('h1', {}, [1, 2, [3, 4]]).children, 1)
	})

	it('should assign multiple array children', () => {
		assert.lengthOf(h('h1', {}, [1, 2], [1, 2]).children, 2)
	})

	it('should assign multiple nested array children', () => {
		assert.lengthOf(h('h1', {}, [1, 2, [3, 4]], [1, 2, [3, 4]]).children, 2)
	})

	it('should validate an element', () => {
		assert.isTrue(isValidElement(h('div')))
	})

	it('should not validate a non-element', () => {
		assert.isFalse(isValidElement('div'))
		assert.isFalse(isValidElement(1))
		assert.isFalse(isValidElement(function () {}))
		assert.isFalse(isValidElement({}))
	})

	it('should clone an element', () => {
		assert.deepEqual(cloneElement(h('h1', {className: 'head'})).props, {className: 'head'})
		assert.deepEqual(cloneElement(h('h1', {className: 'head'}), {className: 'change'}).props, {className: 'change'})
		assert.deepEqual(cloneElement(h('h1', {xmlns: 'xmlns'})).props, {xmlns: 'xmlns'})
	})

	it('should not assign non-props object', () => {
		assert.deepEqual(h('h1', undefined).props, {})
		assert.deepEqual(h('h1', null).props, {})
		assert.deepEqual(h('h1', {}, []).props, {})
		assert.deepEqual(h('h1', {}, h('h1')).props, {})
		assert.deepEqual(h('h1', {}, 1).props, {})
		assert.deepEqual(h('h1', {}, '').props, {})
		assert.deepEqual(h('h1', {}, () => {}).props, {})
	})

	it('should assign children props for components', () => {
		assert.deepEqual(h(() => {}, null, 1).props.children, 1)
		assert.deepEqual(h(() => {}, null, 1, 2).props.children, [1, 2])

		assert.deepEqual(h(() => {}, {}, 1).props.children, 1)
		assert.deepEqual(h(() => {}, {}, 1, 2).props.children, [1, 2])
	})
})
