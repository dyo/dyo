describe('Utility', () => {
	const p = Promise, w = WeakMap, s = Symbol

	before(() => (globalThis.Promise = '', globalThis.WeakMap = '', globalThis.Symbol = ''))
	after(() => (globalThis.Promise = p, globalThis.WeakMap = w, globalThis.Symbol = s))

	it('should support Promise fallback', async () => {
		const {publish} = await import('../src/Utility.js')

		const stack = []
		const refs = {}

		new publish((resolve) => resolve(10)).then(v => stack.push(v)).then(v => stack.push(v))

		const value = new publish((resolve) => refs.current = resolve)

		value.then(v => stack.push(v)).then(v => stack.push(v))
		refs.current(20)

		assert.deepEqual(stack, [10, 1, 20, 3])
	})

	it('should support WeakMap fallback', async () => {
		const {registry} = await import('../src/Utility.js')

		const stack = []
		const refs = {}

		refs.current = registry()

		stack.push(refs.current.set(refs, 10).get(refs), refs.current.has(refs))
		stack.push(refs.current.get({}), refs.current.has({}))

		assert.deepEqual(stack, [10, true, undefined, false])
	})

	it('should support @@iterator fallback', async () => {
		const {iterator} = await import('../src/Utility.js')

		assert.deepEqual([iterator], ['@@iterator'])
	})
})
