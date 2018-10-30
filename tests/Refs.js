import {h, Component, render} from 'dyo'

describe('Refs', () => {
	it('should (un)mount string refs', () => {
		const target = document.createElement('div')
		const refs = {}

		class Primary extends Component {
			render({children}) { return children }
			componentDidMount() { refs.current = this.refs }
		}

		render(h(Primary, h('h1', {ref: 'heading'}, 1)), target, (current) => {
			assert.html(current, '<h1>1</h1>')
			assert.exists(refs.current.heading, ['heading'])
		})

		render(null, target, (current) => {
			assert.html(current, '')
			assert.notExists(refs.current.heading, [''])
		})
	})

	it('should (un)mount object refs', () => {
		const target = document.createElement('div')
		const refs = {}

		render(h('h1', {ref: refs}, 1), target, (current) => {
			assert.html(current, '<h1>1</h1>')
			assert.html(refs.current, '1')
		})

		render(null, target, (current) => {
			assert.equal(refs.current, null)
		})
	})

	it('should (un)mount function refs', () => {
		const target = document.createElement('div')
		const refs = {}

		render(h('h1', {ref: (value) => refs.current = value}, 1), target, (current) => {
			assert.html(current, '<h1>1</h1>')
			assert.html(refs.current, '1')
		})

		render(null, target, (current) => {
			assert.equal(refs.current, null)
		})
	})

	it('should update refs', () => {
		const target = document.createElement('div')
		const refs = {}
		const stack = []

		render(h('h1', {ref: (value) => stack.push(refs.current = value)}, 1), target, (current) => {
			assert.html(current, '<h1>1</h1>')
			assert.html(refs.current, '1')
		})

		render(h('h1', {ref: (value) => stack.push(refs.current = value)}, 2), target, (current) => {
			assert.html(current, '<h1>2</h1>')
			assert.html(refs.current, '2')
		})

		render(null, target, (current) => {
			assert.html(current, '')
			assert.equal(refs.current, null)
			assert.lengthOf(stack, 4)
		})
	})

	it('should unmount null/undefined refs', () => {
		const target = document.createElement('div')
		const refs = {}

		render(h('h1', {ref: (value) => refs.current = value}, 1), target, (current) => {
			assert.html(current, '<h1>1</h1>')
			assert.html(refs.current, '1')
		})

		render(h('h1', {ref: undefined}, 2), target, (current) => {
			assert.html(current, '<h1>2</h1>')
			assert.equal(refs.current, null)
		})

		render(h('h1', {ref: (value) => refs.current = value}, 1), target, (current) => {
			assert.html(current, '<h1>1</h1>')
			assert.html(refs.current, '1')
		})

		render(h('h1', {ref: null}, 2), target, (current) => {
			assert.html(current, '<h1>2</h1>')
			assert.equal(refs.current, null)
		})
	})

	it('should handle invalid refs', () => {
		const target = document.createElement('div')

		render(h('div', {ref: 100}), target)
		render(h('div', {ref: Symbol('')}), target)
	})
})
