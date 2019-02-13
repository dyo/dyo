import {h, memo, render, createContext} from '../index.js'

describe('Context', () => {
	it('should return a context provider', () => {
		assert(typeof createContext('white') === 'function')
	})

	it('should render context children', () => {
		const target = document.createElement('div')
		const stack = []
		const Context = createContext('black')
		const Primary = props => stack.push('render')

		render(h(Context, {value: 'black'}, h(Primary)), target, (current) => {
			assert.html(current, '1')
			assert.deepEqual(stack, ['render'])
		})
	})

	it('should memo context provider', () => {
		const target = document.createElement('div')
		const stack = []
		const Context = memo(createContext('black'), (prev, next) => prev.value === next.value)
		const Primary = props => stack.push('render')

		render(h(Context, {value: 'black'}, h(Primary)), target, (current) => {
			assert.html(current, '1')
			assert.deepEqual(stack, ['render'])
		})

		render(h(Context, {value: 'black'}, h(Primary)), target, (current) => {
			assert.html(current, '1')
			assert.deepEqual(stack, ['render'])
		})

		render(h(Context, {value: 'white'}, h(Primary)), target, (current) => {
			assert.html(current, '2')
			assert.deepEqual(stack, ['render', 'render'])
		})
	})
})
