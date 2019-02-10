describe('Utility', () => {
	const Symbol = globalThis.Symbol

	before(() => globalThis.Symbol = '')
	after(() => globalThis.Symbol = Symbol)

	it('should support @@iterator and @@asyncIterator fallback', async () => {
		const {syncIterator, asyncIterator} = await import('../src/Utility.js?')

		assert.deepEqual([syncIterator, asyncIterator], ['@@iterator', '@@asyncIterator'])
	})
})
