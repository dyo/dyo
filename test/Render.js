import {h, render} from '../index.js'

describe('Render', () => {
	const target = document.createElement('div')
	const refs = {}

	it('should throw when using invalid render targets', () => {
		const {document} = globalThis

		try {
			globalThis.document = undefined
			assert.throws(() => render(null, undefined))
			assert.throws(() => render(null, null))
			assert.throws(() => render(null, NaN))
			assert.throws(() => render(null, 0))
			assert.throws(() => render(null, true))
			assert.throws(() => render(null, false))
		} finally {
			globalThis.document = document
		}
	})

	it('should render to selector', () => {
		render('Hello', 'body', (current) => {
			assert.html(current, 'Hello')

			render(null, 'body', (current) => {
				assert.html(current, '')
			})
		})
	})

	it('should not throw when using invalid elements', () => {
		const target = document.createElement('div')

		assert.throws(() => {
			render(h('!'), target)
		})
	})

	it('should invoke render callback', () => {
		render(null, target, ({nodeName}) => {
			refs.current = nodeName.toLowerCase()
		})
		assert.deepEqual(refs.current, 'div')
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

	it('should not render unknown objects', () => {
		render({}, target, (current) => {
			assert.html(current, '')
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
		render(() => [h('h1', {}, 'Hello'), h('h1', {}, 'World')], target, (current) => {
			assert.html(current, '<h1>Hello</h1><h1>World</h1>')
		})
	})

	it('should render nested array children', () => {
		render(h('div', {}, 1, [2, 3, [4, 5]]), target, (current) => {
			assert.html(current, `<div>12345</div>`)
		})
	})

	it('should not render booleans', () => {
		render(h('div', {}, true, false), target, (current) => {
			assert.html(current, '<div></div>')
		})
	})

	it('should render svg elements', () => {
		render(h('svg', {}, h('path')), target, (current) => {
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
		render(h('svg', {}, h('foreignObject')), target, (current) => {
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
			assert.equal(current.firstChild.value, '')
		})

		render(h('input', {value: null}, '0'), target, (current) => {
			assert.html(current, '<input>', 'value')
			assert.equal(current.firstChild.value, '')
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

	it('should render img width attribute', () => {
		render(h('img', {width: 100}), target, (current) => {
			assert.html(current, '<img width="100">')
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
		render(h('h1', {style: 'width: 100px'}, '0'), target, (current) => {
			assert.html(current, '<h1 style="width: 100px">0</h1>')
		})
	})

	it('should remove undefined styles', () => {
		render(h('div', {style: null}), target, (current) => {
			assert.html(current, `<div></div>`)
		})

		render(h('div', {style: {background: 'red', color: 'red'}}), target, (current) => {
			assert.html(current, '<div style="background: red; color: red;"></div>')
		})

		render(h('div', {style: {background: 'red', color: undefined}}), target, (current) => {
			assert.html(current, `<div style="background: red;"></div>`)
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

	it('should remove/append styles', () => {
		render(h('div', {style: null}), target, (current) => {
			assert.equal(current.firstChild.style.textDecoration, '')
		})

		render(h('div', {style: {'text-decoration': 'none'}}), target, (current) => {
			assert.equal(current.firstChild.style.textDecoration, 'none')
		})

		render(h('div', {style: null}), target, (current) => {
			assert.equal(current.firstChild.style.textDecoration, '')
		})
	})

	it('should fail gracefully when trying to set readonly properties', () => {
		render(h('h2', {}), target, ({firstChild}) => {
			Object.defineProperty(firstChild, 'invalid', {set: () => { throw refs.value = true }})

			render(h('h2', {invalid: true}), target, (current) => {
				assert.equal(refs.value, true)
			})
		})
	})

	it('should render vendor dash case styles', () => {
		render(h('h2', {}), target, ({firstChild}) => {
			Object.defineProperty(firstChild, 'style', {value: { setProperty(name, value) { refs.current = value } }})

			render(h('h2', {style: {'-webkit-border-radius': '20px'}}), target, (current) => {
				assert.equal(refs.current, '20px')
			})
		})
	})
})
