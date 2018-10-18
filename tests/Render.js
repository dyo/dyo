import {h, render} from 'dyo'

describe('Render', () => {
	const target = document.createElement('div')

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

	it('should render a class component', () => {
		render(class { render () { return h('h1', {id: 1}, '2') } }, target, (current) => {
			assert.html(current, '<h1 id="1">2</h1>')
		})
	})

	it('should render a function component', () => {
		render(() => h('h1', {id: 1}, '1'), target, (current) => {
			assert.html(current, '<h1 id="1">1</h1>')
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

	it('should execute render callback', () => {
		const target = document.createElement('div')
		const stack = []

		render(h('div', 1), target, (current) => {
			assert.html(current, '<div>1</div>')
		})
		render(h('div', 2), target, (current) => {
			assert.html(current, '<div>2</div>')
		})
	})

	it('should not execute invalid render callback', () => {
		const target = document.createElement('div')

		render(h('div', 1), target, 'not a function')
		render(h('div', 2), target, null)
	})

	it('should render and update refs', () => {
		const refs = {}

		render([
			h('input', {id: 1, ref: (value) => refs.current = value}),
			h('input', {id: 2})
		], target, (current) => {
			assert.equal(refs.current.id, 1)
		})

		render([
			h('input', {id: 1}),
			h('input', {id: 2, ref: (value) => refs.current = value})
		], target, (current) => {
			assert.equal(refs.current.id, 2)
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

	it('should render un-ordered input attributes', () => {
		render(h('input', {value: 0.4, step: 0.1, type: 'range', min: 0, max: 1}), target, (current) => {
			assert.html(current, '<input type="range" step="0.1" min="0" max="1">')
			assert.equal(current.firstChild.value, '0.4')
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

	it('should render foreignObject in svg', () => {
		render(h('svg', h('foreignObject')), target, (current) => {
			assert.html(current, `<svg><foreignobject></foreignobject></svg>`)
			assert.equal(current.firstChild.namespaceURI, 'http://www.w3.org/2000/svg')
			assert.notEqual(current.firstChild.firstChild.namespaceURI, 'http://www.w3.org/2000/svg')
		})
	})

	it('should render dash-case acceptCharset attribute', () => {
		render(h('form', {acceptCharset: 'ISO-8859-1'}), target, (current) => {
			assert.html(current, '<form accept-charset="ISO-8859-1"></form>')
		})
	})

	it('should render dash-case httpEquiv attribute', () => {
		render(h('meta', {httpEquiv: 'refresh'}), target, (current) => {
			assert.html(current, '<meta http-equiv="refresh">')
		})
	})

	it('should render xlink:href attribute', () => {
		render(h('use', {'xlink:href': '#id'}), target, (current) => {
			assert.html(current, '<use xlink:href="#id"></use>')
		})
	})

	it('should remove xlink:href attribute', () => {
		render(h('use', {'xlink:href': null}), target, (current) => {
			assert.html(current, '<use></use>')
		})
	})

	it('should render an attribute without a value', () => {
		render(h('div', {custom: true}), target, (current) => {
			assert.html(current, '<div custom=""></div>')
		})
	})

	it('should render camel case styles', () => {
		render(h('div', {style: {WebkitTransform: 'scale(2)'}}), target, (current) => {
			assert.equal(current.firstChild.style.WebkitTransform, 'scale(2)')
		})
	})

	it('should render dash case styles', () => {
		render(h('div', {style: {'text-decoration': 'scale(2)'}}), target, (current) => {
			assert.equal(current.firstChild.style.textDecoration, 'scale(2)')
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

	it('should render innerHTML with children', () => {
		const target = document.createElement('div')

		render(h('div', {innerHTML: '<span>X</span><span>Y</span>'}, h('h1', 1), h('h1', 2)), target, (current) => {
			assert.html(current, `<div><h1>1</h1><h1>2</h1><span>X</span><span>Y</span></div>`)
		})

		render(h('div', h('h1', 1), h('h1', 2)), target, (current) => {
			assert.html(current, `<div><h1>1</h1><h1>2</h1></div>`)
		})
	})

	it('should set innerHTML', () => {
		const target = document.createElement('div')

		render(h('div', {innerHTML: '<span>X</span><span>Y</span>'}), target, (current) => {
			assert.html(current, `<div><span>X</span><span>Y</span></div>`)
		})
	})

	it('should remove undefined styles', () => {
		const target = document.createElement('div')

		render(h('div', {style: {color: 'red'}}), target, (current) => {
			assert.html(current, '<div style="color: red;"></div>')
		})

		render(h('div', {style: {color: undefined}}), target, (current) => {
			assert.html(current, `<div style=""></div>`)
		})
	})

	it('should no-op duplicate keys', () => {
		const target = document.createElement('div')

		render(h('div', [h('h1', {key: 1}),h('h2', {key: 1}),h('h3', {key: 2})]), target, (current) => {
			assert.html(current, '<div><h1></h1><h2></h2><h3></h3></div>')
		})
		render(h('div', [h('h1', {key: 1}),h('h2', {key: 1}),h('h3', {key: 2})]), target, (current) => {
			assert.html(current, '<div><h1></h1><h2></h2><h3></h3></div>')
		})
	})

	it('should mount into a document fragment', () => {
		const target = document.createElement('div')
		const fragment = document.createDocumentFragment()

		render(h('div', 'foo'), fragment, (current) => {
			assert.html(target, '')
			target.appendChild(current)
			assert.html(target, '<div>foo</div>')
		})
	})

	it('should render non-primitive attributes', () => {
		const target = document.createElement('div')
		const refs = {}
		const noop = () => {}

		render(h('h1', {ref: (node) => refs.current = node, custom: {first: 1}}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
			assert.deepEqual(refs.current.custom, {first: 1})
		})

		render(h('h1', {ref: (node) => refs.current = node, custom: {first: 1, second: 2}}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
			assert.deepEqual(refs.current.custom, {first: 1, second: 2})
		})

		render(h('h1', {ref: (node) => refs.current = node, custom: null}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
			assert.equal(refs.current.custom, '')
		})

		render(h('h1', {ref: (node) => refs.current = node, custom: {first: 1}}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
			assert.deepEqual(refs.current.custom, {first: 1})
		})

		render(h('h1', {ref: (node) => refs.current = node, custom: noop}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
			assert.equal(refs.current.custom, noop)
		})

		render(h('h1', {ref: (node) => refs.current = node, custom: {first: 1, second: 2}}, '0'), target, (current) => {
			assert.html(current, '<h1>0</h1>')
			assert.deepEqual(refs.current.custom, {first: 1, second: 2})
		})
	})

	it('should render to implicit root target', () => {
		render(1, undefined, (current) => {
			assert.html(current, '1')
		})
	})
})
