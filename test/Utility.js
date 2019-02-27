describe('Utility', () => {
	const Symbol = globalThis.Symbol
	const Promise = globalThis.Promise
	const setTimeout = globalThis.setTimeout

	before(() => globalThis.Symbol = ''), after(() => globalThis.Symbol = Symbol)
	before(() => globalThis.Promise = ''), after(() => globalThis.Promise = Promise)
	before(() => globalThis.setTimeout = ''), after(() => globalThis.setTimeout = setTimeout)

	it('should support iterator fallbacks', async () => {
		const {syncIterator, asyncIterator} = await import('../src/Utility.js?')

		assert.deepEqual([syncIterator, asyncIterator], ['@@iterator', '@@asyncIterator'])
	})

	it('should support deferred polyfill initialization', async () => {
		const {defer, timer} = await import('../src/Utility.js?')

		globalThis.Promise = Promise
		globalThis.setTimeout = setTimeout

		assert.doesNotThrow(() => {
			assert(new defer(() => {}))
			assert(timer(() => {}, 0))
		})
	})
})
