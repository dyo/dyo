describe('Utility', () => {
	const Symbol = globalThis.Symbol
	const Promise = globalThis.Promise
	const setTimeout = globalThis.setTimeout
	const requestAnimationFrame = globalThis.requestAnimationFrame

	before(() => globalThis.Symbol = ''), after(() => globalThis.Symbol = Symbol)
	before(() => globalThis.Promise = ''), after(() => globalThis.Promise = Promise)
	before(() => globalThis.setTimeout = ''), after(() => globalThis.setTimeout = setTimeout)
	before(() => globalThis.requestAnimationFrame = ''), after(() => globalThis.requestAnimationFrame = requestAnimationFrame)

	it('should support iterator fallbacks', async () => {
		const {iterator} = await import('../src/Utility.js?0')

		assert.deepEqual([iterator], ['@@iterator'])
	})

	it('should support deferred polyfill initialization', async () => {
		const {promise, timeout, request} = await import('../src/Utility.js?1')

		globalThis.Promise = Promise
		globalThis.setTimeout = setTimeout
		globalThis.requestAnimationFrame = requestAnimationFrame

		assert.doesNotThrow(() => {
			assert(new promise(() => {}))
			assert(timeout(() => {}, 0))
			assert(request(() => {}, 0))
		})
	})
})
