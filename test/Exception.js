import {h, render, Boundary, useState, useReducer, useLayout} from '../index.js'

describe('Exception', () => {
	it('should not catch exceptions', () => {
		const target = document.createElement('div')
		const stack = assert.spyr(console, 'error')

		assert.throws(() => {
			render(function Primary () { throw 'error!' }, target, () => stack.push('error!'))
		}, 'error!')
		assert.deepEqual(stack, ['Exception: error!\n'])
	})

	it('should not catch nested exceptions', () => {
		const target = document.createElement('div')
		const stack = assert.spyr(console, 'error')

		assert.throws(() => {
			render(function Primary () { return function Secondary () { throw 'error!' } }, target)
		}, 'error!')
		assert.deepEqual(stack, ['Exception: error!\n\tat <Primary>\n'])
	})

	it('should not catch anonymous function names', () => {
		const target = document.createElement('div')
		const stack = assert.spyr(console, 'error')

		assert.throws(() => {
			render(props => props => { throw 'error!' }, target)
		}, 'error!')
		assert.deepEqual(stack, ['Exception: error!\n\tat <anonymous>\n'])
	})

	it('should throw in render callback', () => {
		const target = document.createElement('div')

		assert.throws(() => {
			render(h('div'), target, (current) => {
				throw 'error!'
			})
		}, 'error!')
	})

	it('should throw within an update', () => {
		const target = document.createElement('div')
		const stack = assert.spyr(console, 'error')
		const Primary = props => props.children
		const Secondary = props => {
			if (props.throw) {
				throw 'error!'
			}

			return 'preserve'
		}

		render(h(Primary, {}, h(Secondary, {throw: false})), target)

		assert.throws(() => {
			render(h(Primary, {}, h(Secondary, {throw: true})), target)
		}, 'error!')

		assert.html(target, 'preserve')
		assert.deepEqual(stack, ['Exception: error!\n\tat <Primary>\n'])
	})

	it('should throw within a state update', () => {
		const target = document.createElement('div')
		const stack = assert.spyr(console, 'error')
		const Primary = props => props.children
		const Secondary = props => {
			const [error, setError] = useState(false)
			useLayout(() => {
				setError(true)
			}, [])

			if (error) {
				throw 'error!'
			}

			return 'preserve'
		}

		assert.throws(() => {
			render(h(Primary, {}, h(Secondary)), target)
		}, 'error!')

		assert.html(target, 'preserve')
		assert.deepEqual(stack, ['Exception: error!\n\tat <Primary>\n\tat <Secondary>\n'])
	})

	it('should throw within promise', (done) => {
		const target = document.createElement('div')
		const stack = assert.spyr(console, 'error')
		const Primary = props => {
			return stack.current = Promise.reject()
		}

		render(h(Primary), target, () => {}).then((current) => {
			stack.push('error')
		})

		stack.current.catch((error) => {
			done(assert.deepEqual(stack, ['Exception: undefined\n\tat <Primary>\n']))
		})
	})

	it('should use error boundary fallback in the event of an exception', () => {
		const target = document.createElement('div')
		const Primary = props => {
			return h(Boundary, {fallback: props => JSON.stringify(props)}, h(Secondary))
		}
		const Secondary = props => {
			throw 1
		}

		render(h('div', {}, h(Primary)), target, (current) => {
			assert.html(current, '<div>{"message":1,"bubbles":false}</div>')
		})
	})

	it('should use error boundary fallback array in the event of an exception', () => {
		const target = document.createElement('div')
		const stack = []
		const Primary = props => {
			return h(Boundary, {fallback: props => JSON.stringify(props)}, h(props => { throw 1 }))
		}

		render(h('div', {}, h(Primary)), target, (current) => {
			assert.html(current, '<div>{"message":1,"bubbles":false}</div>')
		})
	})

	it('should dispatch an error boundary action from render', () => {
		const target = document.createElement('div')
		const Primary = props => {
			const [error, dispatch] = useReducer((state, action) => action.type === 'EXCEPTION' ? action : state, false)
			return error ? JSON.stringify(error) : h(Boundary, {fallback: dispatch}, h(props => { throw 1 }))
		}

		render(h('div', {}, h(Primary)), target, (current) => {
			current.firstChild.dispatchEvent(new Event('click'))
		}).then((current) => {
			assert.html(current, '<div>{"message":1,"bubbles":false}</div>')
		})
	})

	it('should dispatch an error boundary action from event', () => {
		const target = document.createElement('div')
		const Primary = props => {
			const [error, dispatch] = useReducer((state, action) => action.type === 'EXCEPTION' ? action : state, false)
			return error ? JSON.stringify(error) : h(Boundary, {fallback: dispatch}, h(props => h('button', {onclick: e => { throw 1 }})))
		}

		render(h(Primary), target, (current) => {
			current.firstChild.dispatchEvent(new Event('click'))
		}).then((current) => {
			assert.html(current, '{"message":1,"bubbles":false}')
		})
	})

	it('should propagate exception within within a failed boundary fallback', () => {
		const target = document.createElement('div')
		const stack = []
		const Primary = props => {
			return h(Boundary, {fallback: props => stack.push(props)}, h(Secondary))
		}
		const Secondary = props => {
			return h(Boundary, {fallback: props => { throw 2 }}, h(props => { throw 1 }))
		}

		render(h(Primary), target, (current) => {
			assert.html(current, '1')
			assert.deepEqual(stack, [{message: 2, bubbles: false}])
		})
	})

	it('should catch errors raised from promise elements', (done) => {
		const target = document.createElement('div')
		const stack = []
		const Primary = props => {
			return h(Boundary, {fallback: props => stack.push(props)}, h(Secondary))
		}
		const Secondary = props => {
			return h(Promise.reject(1))
		}

		render(h(Primary), target, (current) => {
			assert.html(current, '1')
		}).then((current) => {
			done(assert.deepEqual(stack, [{message: 1, bubbles: false}]))
		})
	})

	it('should recover from error boundary in the event of an exception', () => {
		const target = document.createElement('div')
		const Primary = props => {
			const [error, dispatch] = useState('')

			return h(Boundary, {fallback: error => dispatch(error.message)}, error ? error : h(Secondary))
		}
		const Secondary = props => {
			throw 1
		}

		render(h('div', {}, h(Primary)), target, (current) => {
			assert.html(current, '<div>1</div>')
		})
	})
})
