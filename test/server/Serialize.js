import {h, render} from '../../server/index.js'

describe('Serialize', () => {
	it('should not write to non-wrtiable', () => {
		const target = {}

		render('1', target, (current) => {
			assert.html(current, '')
		})
	})

	it('should write to wrtiable(end)', () => {
		const target = new Writable('end')

		render('1', target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should write to wrtiable(send)', () => {
		const target = new Writable('send')

		render('1', target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should send to wrtiable(body)', () => {
		const target = new Writable('body')

		render('1', target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should invoke render callback', () => {
		const target = new Writable('body')
		const stack = []

		render('1', target, (current) => stack.push(current))

		assert.deepEqual(stack, [target])
	})
})
