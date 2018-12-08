import {h, render, Component} from '../../server/index.js'

describe('Stringify', () => {
	it('should stringify text', () => {
		const target = new Writable

		render('1', target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should stringify element', () => {
		const target = new Writable

		render(h('h1', '1'), target, (current) => {
			assert.html(current, '<h1>1</h1>')
		})
	})

	it('should stringify void elements', () => {
		const target = new Writable
		const stack = [
			'area', 'base', 'br', 'meta', 'source', 'keygen', 'img', 'col',
			'embed', 'wbr', 'track', 'param', 'link', 'input', 'hr', '!doctype'
		]

		stack.forEach((type) => {
			render(h(type), target, (current) => {
				assert.html(current, `<${type}/>`)
			})
		})
	})

	it('should stringify attributes', () => {
		const target = new Writable

		render(h('div', {
			onClick: {handleEvent: () => {}}, onload: () => {}, key: 0, ref: {}, foo: true, bar: false, style: {color: 'red'}
		}, h('h1', {className: 'red', style: 'color: red;'}, 1)), target, (current) => {
			assert.html(current, '<div foo="foo" style="color: red;"><h1 class="red" style="color: red;">1</h1></div>')
		})
	})

	it('should stringify innerHTML', () => {
		const target = new Writable

		render(h('div', {innerHTML: '<h1>1</h1>'}), target, (current) => {
			assert.html(current, '<div><h1>1</h1></div>')
		})
	})

	it('should stringify fragments', () => {
		const target = new Writable

		render([h('div'), h('h1', '1')], target, (current) => {
			assert.html(current, '<div></div><h1>1</h1>')
		})
	})

	it('should stringify thenables', () => {
		const target = new Writable

		render(Promise.resolve([h('div'), h('h1', '1')]), target, (current) => {
			assert.html(current, '<div></div><h1>1</h1>')
		})
	})

	it('should stringify components', () => {
		const target = new Writable

		class Primary extends Component {}

		render(h(Primary, '1'), target, (current) => {
			assert.html(current, '1')
		})
	})
})
