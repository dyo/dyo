import {h, render} from '../index.js'

describe('Event', () => {
	it('should not dispatch invalid event', () => {
		const target = document.createElement('div')

		render(h('button', {onClick: {}}), target, (current) => {
			current.firstChild.dispatchEvent(new Event('click'))
			assert.html(current, `<button></button>`)
		})
	})

	it('should dispatch event from element', () => {
		const target = document.createElement('div')
		const stack = []

		render(h('button', {onClick: e => stack.push(e.type)}), target, (current) => {
			current.firstChild.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click'])
			assert.html(current, `<button></button>`)
		})
	})

	it('should dispatch different events', () => {
		const target = document.createElement('div')
		const stack = []

		render(h('button', {onClick: e => stack.push(e.type), onMouseDown: e => stack.push(e.type)}), target, (current) => {
			current.firstChild.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click'])
			current.firstChild.dispatchEvent(new Event('mousedown'))
			assert.deepEqual(stack, ['click', 'mousedown'])
		})
	})

	it('should replace event', () => {
		const target = document.createElement('div')
		const stack = []

		render(h('button', {onClick: e => stack.push(e.type)}), target, (current) => {
			current.firstChild.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click'])
		})

		render(h('button', {onClick: e => stack.push(e.type + '!')}), target, (current) => {
			current.firstChild.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click', 'click!'])
		})
	})

	it('should remove event', () => {
		const target = document.createElement('div')
		const stack = []

		render(h('button', {onClick: e => stack.push(e.type)}), target, (current) => {
			current.firstChild.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click'])
		})

		render(h('button', {}), target, (current) => {
			current.firstChild.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click'])
		})
	})

	it('should dispatch multiple chained events', () => {
		const target = document.createElement('div')
		const stack = []

		render(h('button', {onClick: [e => stack.push(e.type), e => stack.push(e.type)]}), target, (current) => {
			current.firstChild.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click', 'click'])
		})
	})

	it('should dispatch multiple async events', (done) => {
		const target = document.createElement('div')
		const stack = []

		render(h('button', {
			onClick: [e => stack.push(e.type), e => Promise.resolve({
				json: () => Promise.resolve().then(() => stack.push('resolve')), blob: () => {}
			}), e => stack.push(e.type)]
		}), target, (current) => {
			current.firstChild.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click', 'click'])
		}).then((current) => {
			done(assert.deepEqual(stack, ['click', 'click', 'resolve']))
		})
	})
})
