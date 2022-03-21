import {h, render} from '../index.js'

describe('Interface', () => {
	const {document} = globalThis

	before(() => globalThis.document = undefined)
	after(() => globalThis.document = document)

	it('should render to no-op object interface', () => {
		const target = {}
		const Primary = props => [h('h1', 'Hello World')]

		assert.doesNotThrow(() => {
			render(h(Primary), target, (current) => assert.html(current, '<h1>Hello World</h1>'))
		})
	})

	it('should render to no-op string interface', () => {
		const target = {}
		const Primary =  props => [h('h1', 'Hello World')]

		assert.doesNotThrow(() => {
			render(h(Primary), 'foo')
		})
	})
})
