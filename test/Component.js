import {h, memo, render} from '../index.js'

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

	it('should use SameValue equality for default memo memorizer', () => {
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
		const Primary = function * (props) { yield 1, yield 2 }

		render(h(Primary), target, (current) => {
			assert.html(current, '12')
		})
	})

	it('should render and update an async component', (done) => {
		const target = document.createElement('div')
		const Primary = async function (props) { return props.children }

		render(h(Primary, {}, 1), target, (current) => {
			assert.html(current, '1')

			render(h(Primary, {}, 2), target, (current) => {
				done(assert.html(current, '2'))
			})
		})
	})

	it('should render and update an async component import', (done) => {
		const target = document.createElement('div')
		const Primary = async function (props) { return {default: props.children} }

		render(h(Primary, {}, 1), target, (current) => {
			assert.html(current, '1')

			render(h(Primary, {}, 2), target, (current) => {
				done(assert.html(current, '2'))
			})
		})
	})

	it('should pass props to async import', (done) => {
		const target = document.createElement('div')
		const Primary = props => props.children

		render(h(Promise.resolve({default: Primary}), {children: 1}), target, (current) => {
			done(assert.html(current, '1'))
		})
	})

	it('should render placeholder between async resolution', (done) => {
		const target = document.createElement('div')
		const Primary = props => props.children

		render(h(Primary, {}, h(Promise.resolve(1), {}, 'Loading')), target, (current) => {
			done(assert.html(target, '1'))
		})

		assert.html(target, 'Loading')
	})

	it('should short circuit async render', (done) => {
		const target = document.createElement('div')
		const Primary = props => props.children

		render(h(Primary, {}, h(Promise.resolve(1), {}, 'Loading')), target, (current) => {
			done(assert.html(current, '2'))
		})

		assert.html(target, 'Loading')

		render(2, target, (current) => {
			assert.html(current, '2')
		})
	})

	it('should short circuit stale async render', (done) => {
		const target = document.createElement('div')
		const Primary = props => props.children

		render(h(Primary, {}, h(Promise.resolve(1), {}, 'Loading')), target, (current) => {
			assert.html(current, '2')
		})

		assert.html(target, 'Loading')

		render(h(Primary, {}, h(Promise.resolve(2), {}, 'Loading')), target, (current) => {
			done(assert.html(current, '2'))
		})
	})

	it('should update after async render timeout', (done) => {
		const target = document.createElement('div')
		const Primary = props => props.children

		render(h(Primary, {}, h(Promise.resolve('Initial'), {}, '..')), target, (current) => {
			assert.html(current, '..')
		})

		assert.html(target, '..')

		render(h(Primary, {}, h(new Promise((resolve) => setTimeout(resolve, 1040, 'Update')), {}, '...')), target, (current) => {
			done(assert.html(current, 'Update'))
		})

		setTimeout(() => {
			assert.html(target, '...')
		}, 1020)
	})

	it('should render multiple async children', (done) => {
		const target = document.createElement('div')
		const Primary = props => props.children

		render(h(Primary, {}, Promise.resolve('1'), Promise.resolve('2')), target, (current) => {
			assert.html(current, '12')

			render(Promise.resolve([h('div'), h('h1', {}, '1')]), target, (current) => {
				done(assert.html(current, '<div></div><h1>1</h1>'))
			})
		})
	})

	it('should not update unmounted thenable', () => {
		const target = document.createElement('div')
		const Primary = props => props.children

		render(h(Primary, {}, Promise.resolve('1')), target)
		render(null, target)

		assert.html(target, '')
	})

	it('should invoke async callbacks in the right order', (done) => {
		const target = document.createElement('div')
		const stack = []
		const Primary = props => props.children

		render(h(Primary, {}, Promise.resolve('1')), target, (current) => {
			return stack.push(0, current)
		}).then((current) => {
			return stack.push(1, current), new Promise((resolve) => setTimeout(() => resolve(stack.push(2)), 50))
		}).then((current) => {
			done(assert.deepEqual(stack, [0, current, 1, current, 2]))
		})
	})

	it('should render async generator component', (done) => {
		const target = document.createElement('div')
		const Primary = async function * () {
			yield 1
			yield 2
			yield 3
		}

		render(h(Primary), target, (current) => {
			done(assert.html(current, '3'))
		})
	})
})
