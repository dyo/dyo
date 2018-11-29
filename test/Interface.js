import {h, render, Component} from '../index.js'

describe('Interface', () => {
	const document = globalThis.document

	before(() => globalThis.document = undefined)
	after(() => globalThis.document = document)

	it('should render to no-op interface', () => {
		const target = {}

		class Primary extends Component {
			render() { return [h('h1', 'Hello World')] }
		}

		assert.doesNotThrow(() => {
			render(h(Primary), target, (current) => assert.equal(current, target))
		})

		assert.doesNotThrow(() => {
			render(h(Primary), 'foo')
		})
	})
})
