import {h, render} from '../index.js'

describe('Refs', () => {
	it('should use a object ref', () => {
		const target = document.createElement('div')
		const refs = {}
		const Primary = props => {
			return h('h1', props, props.children)
		}

		render(h(Primary, {ref: refs}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
			assert.deepEqual(refs, {current: current.firstChild})
		}).then(() => {
			render(null, target, (current) => {
				assert.deepEqual(refs, {current: null})
			})
		})
	})

	it('should update a object ref', () => {
		const target = document.createElement('div')
		const refs = {}
		const Primary = props => {
			return h('h1', props, props.children)
		}

		render(h(Primary, {ref: refs}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
			assert.deepEqual(refs, {current: current.firstChild})
		}).then(() => {
			render(h(Primary, {ref: {}}, '0'), target, (current) => {
				assert.deepEqual(refs, {current: null})
			})
		})
	})

	it('should use a function ref', () => {
		const target = document.createElement('div')
		const refs = {}
		const Primary = props => {
			return h('h1', props, props.children)
		}

		render(h(Primary, {ref: (current) => refs.current = current}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
			assert.deepEqual(refs, {current: current.firstChild})
		}).then(() => {
			render(null, target, (current) => {
				assert.deepEqual(refs, {current: null})
			})
		})
	})

	it('should update a function object ref', () => {
		const target = document.createElement('div')
		const refs = {}
		const Primary = props => {
			return h('h1', props, props.children)
		}

		render(h(Primary, {ref: refs}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
			assert.deepEqual(refs, {current: current.firstChild})
		}).then(() => {
			render(h(Primary, {ref: (current) => refs.next = current}, '0'), target, (current) => {
				assert.deepEqual(refs, {current: null, next: current.firstChild})
			})
		})
	})

	it('should use a mount/unmount function ref', () => {
		const target = document.createElement('div')
		const stack = []
		const refs = {}
		const Primary = props => {
			return h('h1', props, props.children)
		}

		render(h(Primary, {ref: (current) => {
			stack.push(refs.current = current, 'mount')
			return (current) => { stack.push(refs.current = current, 'unmount') }
		}}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
			assert.deepEqual(refs, {current: current.firstChild})
			assert.deepEqual(stack, [current.firstChild, 'mount'])
		}).then(() => {
			render(null, target, (current) => {
				assert.deepEqual(refs, {current: null})
				assert.deepEqual(stack, [stack[0], stack[1], null, 'unmount'])
			})
		})
	})

	it('should execute element string ref callback', () => {
		const target = document.createElement('div')
		const stack = []

		render(h('input', {}), target, ({firstChild}) => {
			firstChild.callback = () => stack.push(true)

			render(h('input', {ref: 'callback'}), target, (current) => {
				assert.deepEqual(stack, [true])

				render(h('input', {}), target, (current) => {
					assert.html(target, '<input>')
				})
			})
		})
	})
})
