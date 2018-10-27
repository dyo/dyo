import {h, Children} from 'dyo'

describe('Children', () => {
	it('should convert toArray children', () => {
		assert.deepEqual(Children.toArray(null), [])
		assert.deepEqual(Children.toArray({
			[Symbol.iterator]: function* () {
				yield 1
				yield 2
				yield 3
			}
		}), [1, 2, 3])

		assert.deepEqual(Children.toArray([1, '2', true]), [1, '2', true])
		assert.deepEqual(Children.toArray([1, '2', [true]]), [1, '2', true])
		assert.deepEqual(Children.toArray('string'), ['string'])
		assert.deepEqual(Children.toArray(1), [1])
		assert.deepEqual(Children.toArray([null]), [])
		assert.deepEqual(Children.toArray({}), [{}])
		assert.deepEqual(Children.toArray(''), [''])
		assert.deepEqual(Children.toArray(h('h1', '1')), [h('h1', '1')])
		assert.deepEqual(Children.toArray(h('h1', 1, 2, 3).children), h('h1', 1, 2, 3).children)
	})

	it('should map children', () => {
		assert.deepEqual(Children.map(null), [])
		assert.deepEqual(Children.map([null]), [])
		assert.deepEqual(Children.map([1, [2, 3]], x => x + 1), [2, 3, 4])
		assert.deepEqual(Children.map(1, x => x + 1), [2])
		assert.deepEqual(Children.map('1', x => x + 1), ['11'])
		assert.deepEqual(Children.map(h('h1', '1'), x => x), [h('h1', '1')])
	})

	it('should count children', () => {
		assert.deepEqual(Children.count([]), 0)
		assert.deepEqual(Children.count([null]), 0)
		assert.deepEqual(Children.count([1, [2, 3]]), 3)
	})

	it('should filter children', () => {
		assert.deepEqual(Children.filter(null), [])
		assert.deepEqual(Children.filter([null]), [])
		assert.deepEqual(Children.filter([1, [2, 3]], x => x > 1), [2, 3])
		assert.deepEqual(Children.filter(1, x => x === 1), [1])
		assert.deepEqual(Children.filter('1', x => x !== '1'), [])
		assert.deepEqual(Children.filter([h('h1', '1'), h('h2', '2')], x => x.type === 'h1'), [h('h1', '1')])
	})

	it('should only accept one child', () => {
		assert.deepEqual(Children.only(h('h1', '1')), h('h1', '1'))
		assert.throws(() => Children.only())
		assert.throws(() => Children.only([]))
		assert.throws(() => Children.only(2))
	})

	it('should find children', () => {
		assert.deepEqual(Children.find(null), null)
		assert.deepEqual(Children.find([1, 2, 3], x => x === NaN), null)
		assert.deepEqual(Children.find([1, [2, 3]], x => x === 3), 3)
		assert.deepEqual(Children.find(1, x => x === 1), 1)
		assert.deepEqual(Children.find('1', x => x === '1'), '1')
		assert.deepEqual(Children.find(h('h1', '1'), x => x.type === 'h1'), h('h1', '1'))
		assert.deepEqual(Children.find([1, [2, 3]], x => x === 3), 3)
	})

	it('should forEach children', () => {
		const current = {value: 0}

		Children.forEach([1, [2, 3]], (x) => current.value += x)
		assert.deepEqual(current, {value: 6})

		Children.forEach(1, (x) => current.value += x)
		assert.deepEqual(current, {value: 7})

		Children.forEach('1', (x) => current.value += x)
		assert.deepEqual(current, {value: '71'})

		Children.forEach(h('h1', '1'), (x) => current.value = x)
		assert.deepEqual(current, {value: h('h1', '1')})

		Children.forEach(null, (x) => current.value = x)
		assert.deepEqual(current, {value: h('h1', '1')})

		Children.forEach([null], (x) => current.value = x)
		assert.deepEqual(current, {value: h('h1', '1')})
	})
})
