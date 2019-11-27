import {h, render, useState, useEffect, useLayout, useResource, Suspense} from '../index.js'

describe('Serialize', () => {
	it('should write to non-wrtiable', () => {
		const target = {}

		render('1', target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should write to wrtiable(end)', () => {
		const target = new Writable('end')

		render('1', target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should write to wrtiable(write)', () => {
		const target = new Writable('write')

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

		render('1', target, (current) => stack.push(true))

		assert.deepEqual(stack, [true])
	})

	it('should serialize text', () => {
		const target = new Writable

		render('1', target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should serialize element', () => {
		const target = new Writable

		render(h('h1', {}, '1'), target, (current) => {
			assert.html(current, '<h1>1</h1>')
		})
	})

	it('should prepend default doctype', () => {
		const target = new Writable

		render(h('html', {lang: 'en'}, h('title', {}, '1')), target, (current) => {
			assert.html(current, '<!doctype html><html lang="en"><title>1</title></html>')
		})
	})

	it('should serialize void elements', () => {
		const target = new Writable
		const stack = ['area','base','br','meta','source','keygen','img','col','embed','wbr','track','param','link','input','hr','!doctype']

		stack.forEach((type) => {
			render(h(type), target, (current) => {
				assert.html(current, `<${type}>`)
			})
		})
	})

	it('should serialize attributes', () => {
		const target = new Writable

		render(h('div', {
			onClick: {handleEvent: () => {}}, onload: () => {}, key: 0, ref: {}, foo: true, bar: false, style: {color: 'red'}
		}, h('h1', {className: 'red', style: 'color: red;'}, 1)), target, (current) => {
			assert.html(current, '<div foo style="color: red;"><h1 class="red" style="color: red;">1</h1></div>')
		})
	})

	it('should serialize innerHTML', () => {
		const target = new Writable

		render(h('div', {innerHTML: '<h1>1</h1>'}), target, (current) => {
			assert.html(current, '<div><h1>1</h1></div>')
		})
	})

	it('should serialize fragments', () => {
		const target = new Writable

		render([h('div'), h('h1', {}, '1')], target, (current) => {
			assert.html(current, '<div></div><h1>1</h1>')
		})
	})

	it('should serialize components', () => {
		const target = new Writable
		const Primary = props => props.children

		render(h(Primary, {}, '1'), target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should use state hooks', () => {
		const target = new Writable
		const Primary = props => {
			const [state, setState] = useState(props => props.children)
			return state
		}

		render(h(Primary, {}, '1'), target, (current) => {
			assert.html(current, '1')
		})
	})

	it('should not invoke layout hooks', () => {
		const target = new Writable
		const stack = []
		const Primary = props => {
			useLayout(() => stack.push('useLayout'))
			return props.children
		}

		render(h(Primary, {}, '1'), target, (current) => {
			assert.html(current, '1')
			assert.deepEqual(stack, [])
		})
	})

	it('should not invoke effect hooks', (done) => {
		const target = new Writable
		const stack = []
		const Primary = props => {
			useEffect(() => stack.push('useEffect'))
			return props.children
		}

		render(h(Primary, {}, '1'), target, (current) => {
			assert.html(current, '1')
			done(assert.deepEqual(stack, []))
		})
	})

	it('should use a resource', () => {
		const target = new Writable
	  const Primary = props => {
	    return h('div', {}, h(Secondary))
	  }

	  const Secondary = props => {
	    return h('div', {}, useResource(() => Promise.resolve('x')))
	  }

	  render(h(props => h(Suspense, target, h(Primary))), {}, (current) => {
	    assert.html(current, '<div><div>x</div></div>')
	  })
	})

	it('should serialize async component', () => {
		const target = new Writable

		render(props => Promise.resolve([h('div'), h('h1', {}, '1')]), target, (current) => {
			assert.html(current, '<div></div><h1>1</h1>')
		})
	})
})
