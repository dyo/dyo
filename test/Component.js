import {h, memo, render, useMemo} from '../index.js'

describe('Component', () => {
	it('should render a component', () => {
		const target = document.createElement('div')

		render(h(props => 'Primary'), target, (current) => {
			assert.html(current, 'Primary')
		})
	})

	it('should forward component children', () => {
		const target = document.createElement('div')

		render(h(props => props.children, {}, 'Primary'), target, (current) => {
			assert.html(current, 'Primary')
		})
	})

	it('should forward multiple component children', () => {
		const target = document.createElement('div')

		render(h(props => props.children, {}, 'Primary', ' - ', 'Secondary'), target, (current) => {
			assert.html(current, 'Primary - Secondary')
		})
	})

	it('should replace a function Component', () => {
		const target = document.createElement('div')

		render(h(props => 'Primary'), target, (current) => {
			assert.html(current, 'Primary')
		})
		render(h(props => 'Secondary'), target, (current) => {
			assert.html(current, 'Secondary')
		})
	})

	it('should render and update memo component', () => {
		const target = document.createElement('div')
		const stack = []

		const Primary = memo(props => stack.push(props.children))

		render(h(Primary, {value: 0}, '1'), target)
		render(h(Primary, {}, '2'), target, (current) => {
			assert.deepEqual(stack, ['1', '2'])
			assert.html(current, '2')
		})
	})

	it('should render and not update memo component', () => {
		const target = document.createElement('div')
		const stack = []
		const Primary = memo(props => stack.push(props.children))
		const props = {}

		render(h(Primary, {}, '1'), target)
		render(h(Primary, props, '1'), target, (current) => {
			assert.deepEqual(stack, ['1'])
			assert.html(current, '1')
		})
		render(h(Primary, props, '1'), target, (current) => {
			assert.deepEqual(stack, ['1'])
			assert.html(current, '1')
		})
	})

	it('should render and never update memo component', () => {
		const target = document.createElement('div')
		const stack = []
		const Primary = memo(props => stack.push(props.children), props => true)

		render(h(Primary, {}, '1'), target)
		render(h(Primary, {}, '2'), target, (current) => {
			assert.deepEqual(stack, ['1'])
			assert.html(current, '1')
		})
	})

	it('should render and always update memo component', () => {
		const target = document.createElement('div')
		const stack = []
		const Primary = memo(props => stack.push(props.children), props => false)

		render(h(Primary, {}, '1'), target)
		render(h(Primary, {}, '1'), target, (current) => {
			assert.deepEqual(stack, ['1', '1'])
			assert.html(current, '2')
		})
	})

	it('should use same value equality for default memo memorizer', () => {
		const target = document.createElement('div')
		const stack = []
		const Primary = memo(props => stack.push(props.children))

		render(h(Primary, {value: +0}, '1'), target)
		render(h(Primary, {value: -0}, '1'), target, (current) => {
			assert.deepEqual(stack, ['1', '1'])
			assert.html(current, '2')
		})
		render(h(Primary, {value: NaN}, '1'), target, (current) => {
			assert.deepEqual(stack, ['1', '1', '1'])
			assert.html(current, '3')
		})
		render(h(Primary, {value: NaN}, '1'), target, (current) => {
			assert.deepEqual(stack, ['1', '1', '1'])
			assert.html(current, '3')
		})
	})

	it('should should remove a component from an element', () => {
		const target = document.createElement('div')
		const A = props => props.children

		render(h('div', {}, h(A, {key: 'A'}, h('h1', {}, 'A')), h('div', {key: 'B'}, 'B')), target, (current) => {
			assert.html(target, `<div><h1>A</h1><div>B</div></div>`)
		})

		render(h('div', {}, h('div', {key: 'B'}, 'B')), target, (current) => {
			assert.html(target, `<div><div>B</div></div>`)
		})
	})

	it('should render a generator component', () => {
		const target = document.createElement('div')
		const Primary = function* (props) { yield 1, yield 2 }

		render(h(Primary), target, (current) => {
			assert.html(current, '12')
		})
	})
})
