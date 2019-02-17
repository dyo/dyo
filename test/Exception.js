import {h, render, useState, useLayout} from '../index.js'

describe('Exception', () => {
	it('should not render invalid elements', () => {
		const target = document.createElement('div')

		assert.throws(() => {
			render(h('!'), target)
		})
	})

	it('should not render to an invalid target', () => {
		assert.throws(() => {
			render('hello')
		})
	})

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
})
