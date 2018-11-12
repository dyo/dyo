import {registry, publish} from '../src/Utility.js'

describe('Utility', () => {
	it('should support Promise fallback', () => {
		const promise = globalThis.Promise
		const stack = []
		const refs = {}

		try {
			globalThis.Promise = undefined

			new publish((resolve) => resolve(10)).then(v => stack.push(v)).then(v => stack.push(v))

			const value = new publish((resolve) => refs.current = resolve)

			value.then(v => stack.push(v)).then(v => stack.push(v))
			refs.current(20)
		} finally {
			globalThis.Promise = promise
		}

		assert.deepEqual(stack, [10, 1, 20, 3])
		assert.equal(globalThis.Promise, promise)
	})

	it('should support WeakMap fallback', () => {
		const weakmap = globalThis.WeakMap
		const stack = []
		const refs = {}

		try {
			globalThis.WeakMap = undefined
			refs.current = registry()

			stack.push(refs.current.set(refs, 10).get(refs), refs.current.has(refs))
			stack.push(refs.current.get({}), refs.current.has({}))
		} finally {
			globalThis.WeakMap = weakmap
		}

		assert.deepEqual(stack, [10, true, undefined, false])
		assert.equal(globalThis.WeakMap, weakmap)
	})

	it('should support Symbol.iterator fallback', async () => {
		const symbol = globalThis.Symbol
		const stack = []

		try {
			globalThis.Symbol = undefined

			const {iterator} = await import('../src/Utility.js?')

			stack.push(iterator)
		} finally {
			globalThis.Symbol = symbol
		}

		assert.deepEqual(stack, ['@@iterator'])
		assert.equal(globalThis.Symbol, symbol)
	})
})
