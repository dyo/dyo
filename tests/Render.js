import {h, render} from 'dyo'

describe('Render', () => {
	const target = document.createElement('div')
	const refs = {}

	it('should invoke render callback', () => {
		render(null, target, (current) => {
			refs.current = current.nodeName.toLowerCase()
		})
		assert.deepEqual(refs, {current: 'div'})
	})

	it('should render null', () => {
		render(null, target, (current) => {
			assert.html(current, '')
		})
	})

	it('should render text', () => {
		render('hello', target, (current) => {
			assert.html(current, 'hello', 'render text')
		})
	})

	it('should render an iteratable', () => {
		render(h('div', {}, {
			[Symbol.iterator]: function* () {
				yield 1
				yield 2
				yield 3
			}
		}), target, (current) => {
			assert.html(current, '<div>123</div>')
		})
	})

	it('should render an array', () => {
		render(() => [h('h1', 'Hello'), h('h1', 'World')], target, (current) => {
			assert.html(current, '<h1>Hello</h1><h1>World</h1>')
		})
	})

	it('should render nested array children', () => {
		render(h('div', 1, [2, 3, [4, 5]]), target, (current) => {
			assert.html(current, `<div>12345</div>`)
		})
	})

	it('should not render booleans', () => {
		render(h('div', true, false), target, (current) => {
			assert.html(current, '<div></div>')
		})
	})

	it('should render svg elements', () => {
		render(h('svg', h('path')), target, (current) => {
			assert.html(current, `<svg><path></path></svg>`)
			assert.equal(current.firstChild.namespaceURI, 'http://www.w3.org/2000/svg')
			assert.equal(current.firstChild.firstChild.namespaceURI, 'http://www.w3.org/2000/svg')
		})
	})

	it('should render mathml elements', () => {
		render(h('math'), target, (current) => {
			assert.html(current, `<math></math>`)
			assert.equal(current.firstChild.namespaceURI, 'http://www.w3.org/1998/Math/MathML')
		})
	})

	it('should render foreignObject within svg', () => {
		render(h('svg', h('foreignObject')), target, (current) => {
			assert.html(current, `<svg><foreignobject></foreignobject></svg>`)
			assert.equal(current.firstChild.namespaceURI, 'http://www.w3.org/2000/svg')
			assert.notEqual(current.firstChild.firstChild.namespaceURI, 'http://www.w3.org/2000/svg')
		})
	})

	it('should not render a null or undefined attribute', () => {
		render(h('h1', {prop: undefined}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
		})

		render(h('h1', {prop: null}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
		})
	})

	it('should not render an null or undefined property', () => {
		render(h('input', {value: undefined}, '0'), target, (current) => {
			assert.html(current, '<input>', 'value')
		})

		render(h('a', {href: null}, '0'), target, (current) => {
			assert.html(current, '<a>0</a>', 'href')
		})
	})

	it('should render a class attribute', () => {
		render(h('h1', {class: 1}, '0'), target, (current) => {
			assert.html(current, '<h1 class="1">0</h1>')
		})

		render(h('h1', {className: 2}, '0'), target, (current) => {
			assert.html(current, '<h1 class="2">0</h1>')
		})
	})

	it('should render width attribute', () => {
		render(h('div', {width: '100px'}), target, (current) => {
			assert.html(current, '<div width="100px"></div>')
		})
	})

	it('should render img width attribute', () => {
		render(h('img', {width: '100px'}), target, (current) => {
			assert.html(current, '<img width="100px">')
		})
	})

	it('should render acceptCharset attribute', () => {
		render(h('form', {acceptCharset: 'ISO-8859-1'}), target, (current) => {
			assert.html(current, '<form accept-charset="ISO-8859-1"></form>')
		})
	})

	it('should render httpEquiv attribute', () => {
		render(h('meta', {httpEquiv: 'refresh'}), target, (current) => {
			assert.html(current, '<meta http-equiv="refresh">')
		})
	})

	it('should render a boolean attribute', () => {
		render(h('div', {disabled: true}), target, (current) => {
			assert.html(current, '<div disabled="disabled"></div>')
		})

		render(h('input', {checked: false}), target, (current) => {
			assert.html(current, '<input>')
		})
	})

	it('should render innerHTML', () => {
		const target = document.createElement('div')

		render(h('div', {innerHTML: '<span>X</span><span>Y</span>'}), target, (current) => {
			assert.html(current, `<div><span>X</span><span>Y</span></div>`)
		})
	})

	it('should render style objects', () => {
		render(h('h1', {style: {width: '100px'}}, '0'), target, (current) => {
			assert.html(current, '<h1 style="width: 100px;">0</h1>')
		})
	})

	it('should render style strings', () => {
		render(h('h1', {style: 'width:100px'}, '0'), target, (current) => {
			assert.html(current, '<h1 style="width:100px">0</h1>')
		})
	})

	it('should remove undefined styles', () => {
		render(h('div', {style: {color: 'red'}}), target, (current) => {
			assert.html(current, '<div style="color: red;"></div>')
		})

		render(h('div', {style: {color: undefined}}), target, (current) => {
			assert.html(current, `<div style=""></div>`)
		})
	})

	it('should render camel case styles', () => {
		render(h('div', {style: {marginTop: '2px'}}), target, (current) => {
			assert.equal(current.firstChild.style.marginTop, '2px')
		})
	})

	it('should render and update styles', () => {
		render(h('div', {style: {color: 'red'}}), target, (current) => {
			assert.equal(current.firstChild.style.color, 'red')
		})

		render(h('div', {style: {color: 'blue'}}), target, (current) => {
			assert.equal(current.firstChild.style.color, 'blue')
		})
	})

	it('should render and not update styles', () => {
		render(h('div', {style: {color: 'red'}}), target, (current) => {
			assert.equal(current.firstChild.style.color, 'red')
		})
		render(h('div', {style: {color: 'red'}}), target, (current) => {
			assert.equal(current.firstChild.style.color, 'red')
		})
	})

	it('should remove style', () => {
		render(h('div', {style: 'color:red;'}), target, (current) => {
			assert.html(current, '<div style="color:red;"></div>')
		})

		render(h('div', {style: false}), target, (current) => {
			assert.html(current, '<div></div>')
		})
	})

	it('should render dash case styles', () => {
		render(h('div', {style: {'text-decoration': 'none'}}), target, (current) => {
			assert.equal(current.firstChild.style.textDecoration, 'none')
		})
	})

	it('should remove false styles', () => {
		render(h('div', {style: {'text-decoration': 'none'}}), target, (current) => {
			assert.equal(current.firstChild.style.textDecoration, 'none')
		})

		render(h('div', {style: {'text-decoration': false}}), target, (current) => {
			assert.equal(current.firstChild.style.textDecoration, '')
		})
	})

	it('should render vendor dash case styles', () => {
		render(h('div', {style: {'-webkit-border-radius': '20px'}}), target, (current) => {
			// TODO: JSDOM does not support style.setProperty(...) API, file a report.
			// assert.equal(current.firstChild.style.getPropertyValue('-webkit-border-radius'), '20px')
		})
	})

	it('should fail gracefully when trying to set readonly properties', () => {
		render(h('div', {ref: refs}), target, (current) => {
			Object.defineProperty(refs.current, 'invalid', {set: () => { throw refs.current = true }})

			render(h('div', {ref: refs, invalid: true}), target, (current) => {
				assert.html(current, '<div invalid="invalid"></div>')
				assert.deepEqual(refs, {current: true})
			})
		})
	})
})
