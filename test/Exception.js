import {h, render} from '../index.js'

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
			render(function Primary () { throw 'error!' }, target)
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

	it('should throw in render callback', () => {
		const target = document.createElement('div')

		assert.throws(() => render(h('div'), target, (current) => {
			throw 'error!'
		}), 'error!')
	})
})
