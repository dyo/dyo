import {h, Component, Fragment, render} from 'dyo'

const target = document.createElement('div')

describe('Fragment', () => {
	it('should render a fragment', () => {
		render([h('h1', {key: 1}, 1),], target, (current) => {
			assert.html(current, '<h1>1</h1>')
		})
	})

	it('should append to tail of a fragment', () => {
		render([h('h1', {key: 1}, 1), h('h1', {key: 2}, 2)], target, (current) => {
			assert.html(current, '<h1>1</h1><h1>2</h1>')
		})
	})

	it('should remove an element from the tail of a fragment', () => {
		render([h('h1', {key: 1}, 1)], target, (current) => {
			assert.html(current, '<h1>1</h1>')
		})
	})

	it('should append multiple elements to the tail of a fragment', () => {
		render([h('h1', {key: 1}, 1), h('h1', {key: 3}, 3), h('h1', {key: 2}, 2)], target, (current) => {
			assert.html(current, '<h1>1</h1><h1>3</h1><h1>2</h1>')
		})
	})

	it('should remove an element from the middle of a fragment', () => {
		render([h('h1', {key: 1}, 1), h('h1', {key: 2}, 2)], target, (current) => {
			assert.html(current, '<h1>1</h1><h1>2</h1>')
		})
	})

	it('should insert an element into the middle of a fragment', () => {
		render([h('h1', {key: 1}, 1), h('h1', {key: 3}, 3), h('h1', {key: 2}, 2)], target, (current) => {
			assert.html(current, '<h1>1</h1><h1>3</h1><h1>2</h1>')
		})
	})

	it('should insert an element to the head of a fragment', () => {
		render([h('h1', {key: 4}, 4), h('h1', {key: 1}, 1), h('h1', {key: 3}, 3), h('h1', {key: 2}, 2)], target, (current) => {
			assert.html(current, '<h1>4</h1><h1>1</h1><h1>3</h1><h1>2</h1>')
		})
	})

	it('should replace a fragment', () => {
		render(h('h2', 1), target, (current) => {
			assert.html(current, '<h2>1</h2>')
		})
	})

	it('should render a single fragment within a fragment', () => {
		render([h(Fragment, {key: 1}, 1)], target, (current) => {
			assert.html(target, '1')
		})
	})

	it('should render multiple fragments within a fragment', () => {
		render([h(Fragment, {key: 1}, 1), h(Fragment, {key: 2}, 2)], target, (current) => {
			assert.html(target, '12')
		})
	})

	it('should remove a fragment from a fragment', () => {
		render([h(Fragment, {key: 1}, 1)], target, (current) => {
			assert.html(target, '1')
		})
	})

	it('should append a fragment to the end of a fragment', () => {
		render([h(Fragment, {key: 1}, 1), h(Fragment, {key: 3}, 3)], target, (current) => {
			assert.html(target, '13')
		})
	})

	it('should insert a fragment into the middle of a fragment', () => {
		render([h(Fragment, {key: 1}, 1), h(Fragment, {key: 2}, 2), h(Fragment, {key: 3}, 3)], target, (current) => {
			assert.html(target, '123')
		})
	})

	it('should remove a fragment from the middle of a fragment', () => {
		render([h(Fragment, {key: 1}, 1), h(Fragment, {key: 3}, 3)], target, (current) => {
			assert.html(target, '13')
		})
	})

	it('should move a fragment within a fragment', () => {
		render([h(Fragment, {key: 3}, 3), h(Fragment, {key: 1}, 1)], target, (current) => {
			assert.html(target, '31')
		})
		render([h(Fragment, {key: 1}, 1), h(Fragment, {key: 3}, 3)], target, (current) => {
			assert.html(target, '13')
		})
	})

	it('should move an element within a fragment', () => {
		render([h('h1', {key: 1}, 1), h('h1', {key: 3}, 3), h('h1', {key: 2}, 2)], target, (current) => {
			assert.html(current, '<h1>1</h1><h1>3</h1><h1>2</h1>')
		})

		render([h('h1', {key: 1}, 1), h('h1', {key: 2}, 2), h('h1', {key: 3}, 3)], target, (current) => {
			assert.html(current, '<h1>1</h1><h1>2</h1><h1>3</h1>')
		})
	})

	it('should render a fragment from a component', () => {
		render(h(Component, [1, 2]), target, (current) => {
			assert.html(current, '12')
		})
	})
})
