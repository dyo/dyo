import {h, render, Portal} from '../index.js'

describe('Portal', () => {
	const parent = document.documentElement.lastChild
	const target = parent.appendChild(document.createElement('main'))
	const portal = parent.appendChild(document.createElement('aside'))

	it('should render a portal', () => {
		render(h('div', {}, h(Portal, {key: 1, target: portal},
			h('h1', {key: 1}, 1)
		)), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside><h1>1</h1></aside>')
		})
	})

	it('should append to a portal', () => {
		render(h('div', {}, h(Portal, {key: 1, target: portal},
			h('h1', {key: 1}, 1),
			h('h1', {key: 2}, 2)
		)), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside><h1>1</h1><h1>2</h1></aside>')
		})
	})

	it('should insert into a portal', () => {
		render(h('div', {}, h(Portal, {key: 1, target: portal},
			h('h1', {key: 1}, 1),
			h('h1', {key: 3}, 3),
			h('h1', {key: 2}, 2)
		)), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside><h1>1</h1><h1>3</h1><h1>2</h1></aside>')
		})
	})

	it('should move a portals children', () => {
		render(h('div', {}, h(Portal, {key: 1, target: portal},
			h('h1', {key: 1}, 1),
			h('h1', {key: 2}, 2),
			h('h1', {key: 3}, 3)
		)), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside><h1>1</h1><h1>2</h1><h1>3</h1></aside>')
		})
	})

	it('should remove from within a portal', () => {
		render(h('div', {}, h(Portal, {key: 1, target: portal},
			h('h1', {key: 1}, 1),
			h('h1', {key: 3}, 3)
		)), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside><h1>1</h1><h1>3</h1></aside>')
		})
	})

	it('should remove from the tail of a portal', () => {
		render(h('div', {}, h(Portal, {key: 1, target: portal},
			h('h1', {key: 1}, 1)
		)), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside><h1>1</h1></aside>')
		})
	})

	it('should remove from the head of a portal', () => {
		render(h('div', {}, h(Portal, {key: 1, target: portal})), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside></aside>')
		})
	})

	it('should insert into the head of a portal', () => {
		render(h('div', {}, h(Portal, {key: 1, target: portal},
			h('h1', {key: 1}, 1)
		)), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside><h1>1</h1></aside>')
		})
	})

	it('should insert before a portal', () => {
		render(h('div', {}, h('h1', {key: 0}, 0), h(Portal, {key: 1, target: portal},
			h('h1', {key: 1}, 1)
		)), target, (current) => {
			assert.html(parent, '<main><div><h1>0</h1></div></main><aside><h1>1</h1></aside>')
		})
	})

	it('should create a portal with a single child', () => {
		render(h('div', {}, h(Portal, {key: 1, target: portal}, h('h1', {key: 1}, 1))), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside><h1>1</h1></aside>')
		})
	})

	it('should render a nested portal', () => {
		render(h('div', {}, h('h1', {key: 0}, 0), h(Portal, {key: 1, target: portal},
			h('h1', {key: 1}, 1), h(Portal, {key: 2, target: portal}, h('h1', {key: 2}, 2))
		)), target, (current) => {
			assert.html(parent, '<main><div><h1>0</h1></div></main><aside><h1>1</h1><h1>2</h1></aside>')
		})
	})

	it('should remove nested portal', () => {
		render(null, target, (current) => {
			assert.html(parent, '<main></main><aside></aside>')
		})
	})

	it('should render a portal selector', () => {
		render(h('div', {}, h(Portal, {key: 1, target: 'aside'}, h('h1', {key: 1}, 1))), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside><h1>1</h1></aside>')
		})
	})

	it('should reparent a portal', () => {
		const refs = portal.children[0]

		render(h('div', {}, h(Portal, {key: 1, target: 'main'}, h('h1', {key: 1}, 1))), target, (current) => {
			assert.html(parent, '<main><div></div><h1>1</h1></main><aside></aside>')
			assert.equal(current.children[1], refs)
		})
	})

	it('should render and remove properties on portal target', () => {
		render(h('div', {}, h(Portal, {key: 1, target: portal, class: 'abc'},
			h('h1', {key: 1}, 1)
		)), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside class="abc"><h1>1</h1></aside>')

			render(null, target, (current) => {
				assert.html(parent, '<main></main><aside></aside>')
			})
		})
	})

	it('should render and remove events on portal target', () => {
		const stack = []

		render(h('div', {}, h(Portal, {key: 1, target: portal, onClick: e => stack.push(e.type)},
			h('h1', {key: 1}, 1)
		)), target, (current) => {
			assert.html(parent, '<main><div></div></main><aside><h1>1</h1></aside>')
			portal.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click'])

			render(null, target, (current) => {
				assert.html(parent, '<main></main><aside></aside>')
				portal.dispatchEvent(new Event('click'))
				assert.deepEqual(stack, ['click'])
			})
		})
	})

	it('should render a portal to default target', () => {
		render(h('div', {}, h(Portal, {target: 'html'}, h('h1', {}, 1))), target, (current) => {
			assert.html(document.documentElement, '<head></head><body><main><div></div></main><aside></aside></body><h1>1</h1>')

			render(null, target, (current) => {
				assert.html(document.documentElement, '<head></head><body><main></main><aside></aside></body>')
			})
		})
	})
})
