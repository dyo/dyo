test('Children', ({assert, done, deepEqual}) => {
	var {map, only, count, forEach, toArray} = Children
	var index = 0
	var element = h('h1', '1')

	assert(deepEqual(toArray([1, '2', true]), [1, '2', true]), 'toArray([])')
	assert(deepEqual(toArray([1, '2', [true]]), [1, '2', true]), 'toArray([nested])')
	assert(deepEqual(toArray('string'), ['string']), 'toArray(string)')
	assert(deepEqual(toArray(1), [1]), 'toArray(number)')
	assert(toArray(element)[0] === element, 'toArray(element)')
	assert(toArray(h('h1', 1, 2, 3).children).length === 3, 'toArray(element.children)')

	assert(deepEqual(map([1, [2, 3]], x => x+1), [2, 3, 4]), 'map([])')
	assert(deepEqual(map(1, x => x+1), [2]), 'map(number)')
	assert(deepEqual(map('1', x => x+1), ['11']), 'map(string)')
	assert(map(element, x => x)[0] === element, 'map(element)')

	forEach([1, [2, 3]], (x) => index += x)
	assert(index === 6, 'forEach([])')

	forEach(1, (x) => index += x)
	assert(index === 7, 'forEach(number)')

	forEach('1', (x) => index += x)
	assert(index === '71', 'forEach(string)')

	forEach(element, (x) => index = x)
	assert(index === element, 'forEach(element)')

	assert(count([]) === 0, 'count([])')
	assert(count([1, [2, 3]]) === 3, 'count([3])')

	assert(only(element) === element, 'only(element)')

	try {
		only(1)
	} catch (e) {
		assert(true, 'only(any)')
	}

	done()
})
