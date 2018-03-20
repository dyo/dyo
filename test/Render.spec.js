describe('Render', () => {
	let container = document.createElement('div')

	it('should render dangerouslySetInnerHTML', () => {
		render(h('h1', {dangerouslySetInnerHTML: {__html: '<div>test</div>'}}), container)
		assert.html(container, '<h1><div>test</div></h1>', 'dangerouslySetInnerHTML')
	})

	it('should render null', () => {
		render(null, container)
		assert.html(container, '')
	})

	it('should render text', () => {
		render('hello', container)
		assert.html(container, 'hello', 'render text')
	})

	it('should not render an undefined attribute', () => {
		render(h('h1', {className: undefined}, '0'), container)
		assert.html(container, '<h1>0</h1>')
	})

	it('should not render a null attribute', () => {
		render(h('h1', {prop: null}, '0'), container)
		assert.html(container, '<h1>0</h1>')
	})

	it('should render a class attribute', () => {
		render(h('h1', {class: 1}, '0'), container)
		assert.html(container, '<h1 class="1">0</h1>')
	})

	it('should render a className property', () => {
		render(h('h1', {className: 2}, '0'), container)
		assert.html(container, '<h1 class="2">0</h1>')
	})

	it('should not render an undefined property', () => {
		render(h('input', {value: undefined}, '0'), container)
		assert.html(container, '<input>', 'value')

		render(h('a', {href: undefined}, '0'), container)
		assert.html(container, '<a>0</a>', 'href')
	})

	it('should render style objects', () => {
		render(h('h1', {style: {width: '100px'}}, '0'), container)
		assert.html(container, '<h1 style="width: 100px;">0</h1>')
	})

	it('should render style strings', () => {
		render(h('h1', {style: 'width:100px'}, '0'), container)
		assert.html(container, '<h1 style="width:100px">0</h1>')
	})

	it('should render width attribute', () => {
		render(h('div', {width: '100px'}), container)
		assert.html(container, '<div width="100px"></div>')
	})

	it('should render img width attribute', () => {
		render(h('img', {width: '100px'}), container)
		assert.html(container, '<img width="100px">')
	})

	it('should render un-ordered input attributes', () => {
		render(h('input', {value: 0.4, step: 0.1, type: 'range', min: 0, max: 1}), container)
		assert.html(container, '<input type="range" step="0.1" min="0" max="1">')
		assert.equal(container.firstChild.value, '0.4')
	})

	it('should render a class component', () => {
		render(class {
			render () {
				return h('h1', {id: 1}, '2')
			}
		}, container)
		assert.html(container, '<h1 id="1">2</h1>')
	})

	it('should render a function component', () => {
		render(() => h('h1', {id: 1}, '1'), container);
		assert.html(container, '<h1 id="1">1</h1>')
	})

	it('should render an iteratable', () => {
		let iteratable = {
			[Symbol.iterator]: function* () {
		    yield 1
		    yield 2
		    yield 3
			}
		}
		render(() => iteratable, container)
		assert.html(container, '123')

		render(h('div', iteratable), container)
		assert.html(container, '<div>123</div>')
	})

	it('should render an array', () => {
		render(() => [h('h1', 'Hello'), h('h1', 'World')], container)
		assert.html(container, '<h1>Hello</h1><h1>World</h1>')
	})

	it('should unmount a component', () => {
		assert.equal(unmountComponentAtNode(container), true)
		assert.html(container, '')
	})

	it('should (un)mount ref function(instance)', () => {
		let refs = null
		let A = class {
			render() {
				return null
			}
		}

		render(class {
			render() {
				return h(A, {ref: (value) => refs = value})
			}
		}, container)
		assert.instanceOf(refs, A, 'ref function(instance#mount)')

		unmountComponentAtNode(container)
		assert.equal(refs, null, 'ref function(instance#unmount)')
	})

	it('should (un)mount ref string(instance)', () => {
		let refs = null
		let A = class {
			render() {
				return null
			}
		}

		render(class {
			componentDidMount() {
				refs = this.refs
			}
			render() {
				return h(A, {ref: 'instance'})
			}
		}, container)
		assert.instanceOf(refs.instance, A, 'ref string(instance#mount)')

		unmountComponentAtNode(container)
		assert.equal(refs.instance, null, 'ref string(node#unmount)')
	})

	it('should unmount undefined ref', () => {
		let container = document.createElement('div')
		let refs = undefined

		render(h('h1', {ref: (value) => refs = value}), container)
		render(h('h1', {ref: undefined}), container)
		assert.equal(refs, null)
	})

	it('should unmount null ref', () => {
		let container = document.createElement('div')
		let refs = undefined

		render(h('h1', {ref: (value) => refs = value}), container)
		render(h('h1', {ref: null}), container)
		assert.equal(refs, null)
	})

	it('should render nested array children', () => {
		render(h('div', 1, [2, 3, [4, 5]]), container)
		assert.html(container, `<div>12345</div>`)
	})

	it('should not render booleans', () => {
		render(h('div', true, false), container),
		assert.html(container, '<div></div>')
	})

	it('should render svg elements', () => {
		render(h('svg', h('path')), container)
		assert.html(container, `
			<svg>
				<path></path>
			</svg>
		`)
		assert.propertyVal(container.firstChild, 'namespaceURI', 'http://www.w3.org/2000/svg')
		assert.propertyVal(container.firstChild.firstChild, 'namespaceURI', 'http://www.w3.org/2000/svg')
	})

	it('should render mathml elements', () => {
		render(h('math'), container)
		assert.html(container, `<math></math>`)
		assert.propertyVal(container.firstChild, 'namespaceURI', 'http://www.w3.org/1998/Math/MathML')
	})

	it('should render foreignObject in svg', () => {
		render(h('svg', h('foreignObject')), container)
		assert.html(container, `<svg><foreignobject></foreignobject></svg>`)
		assert.propertyVal(container.firstChild, 'namespaceURI', 'http://www.w3.org/2000/svg')
		assert.notPropertyVal(container.firstChild.firstChild, 'namespaceURI', 'http://www.w3.org/2000/svg')
	})

	it('should render dash-case acceptCharset attribute', () => {
		render(h('form', {acceptCharset: 'ISO-8859-1'}), container)
		assert.html(container, '<form accept-charset="ISO-8859-1"></form>')
	})

	it('should render dash-case httpEquiv attribute', () => {
		render(h('meta', {httpEquiv: 'refresh'}), container)
		assert.html(container, '<meta http-equiv="refresh">')
	})

	it('should render to documentElement', () => {
		let container = document.createElement('div')
		let documentElement = document.documentElement

		Object.defineProperty(document, 'documentElement', {
		  enumerable: true,
		  configurable: true,
		  writable: true,
		  value: container
		})

		render(1)

		assert.html(container, '1')

		Object.defineProperty(document, 'documentElement', {
		  enumerable: true,
		  configurable: true,
		  writable: true,
		  value: documentElement
		})
	})

	it('should render xlink:href attribute', () => {
		render(h('use', {'xlink:href': '#id'}), container)
		assert.html(container, '<use xlink:href="#id"></use>')
	})

	it('should remove xlink:href attribute', () => {
		render(h('use', {'xlink:href': null}), container)
		assert.html(container, '<use></use>')
	})

	it('should render an attribute without a value', () => {
		render(h('div', {custom: true}), container)
		assert.html(container, '<div custom=""></div>')
	})

	it('should render camel case styles', () => {
		render(h('div', {style: {WebkitTransform: 'scale(2)'}}), container)
		assert.equal(container.firstChild.style.WebkitTransform, 'scale(2)')
	})

	it('should render dash case styles', () => {
		render(h('div', {style: {'-webkit-transform': 'scale(2)'}}), container)
		assert.equal(container.firstChild.style.WebkitTransform, 'scale(2)')
	})

	it('should render and update styles', () => {
		render(h('div', {style: {color: 'red'}}), container)
		render(h('div', {style: {color: 'blue'}}), container)

		assert.equal(container.firstChild.style.color, 'blue')
	})

	it('should render and not update styles', () => {
		render(h('div', {style: {color: 'red'}}), container)
		render(h('div', {style: {color: 'red'}}), container)

		assert.equal(container.firstChild.style.color, 'red')
	})

	it('should execute render callback', () => {
		let container = document.createElement('div')
		let stack = []
		let refs = null
		let A = class {
			render() {
				return 1
			}
		}

		render(h(A), container, function () {
			stack.push(refs = this)
		})

		render(h(A), container, function () {
			stack.push(refs = this)
		})

		assert.doesNotThrow(() => {
			render(h(A), container, 'not a function')
		})

		assert.html(container, '1')
		assert.notEqual(refs, null)
		assert.instanceOf(refs, A)
		assert.lengthOf(stack, 2)
	})

	it('should render and update autofocus', () => {
		let refs = null

		render([
			h('input', {autofocus: true, ref: (value) => refs = value}),
			h('input', {autofocus: false})
		], container)

		assert.equal(document.activeElement, refs)

		render([
			h('input', {autofocus: !true}),
			h('input', {autofocus: !false, ref: (value) => refs = value})
		], container)

		assert.equal(document.activeElement, refs)
	})

	it('should render dangerouslySetInnerHTML with children', () => {
		let container = document.createElement('div')

		render(
			h('div', {dangerouslySetInnerHTML: {__html: '<span>X</span><span>Y</span>'}},
				h('h1', 1),
				h('h1', 2)
			),
			container
		)

		assert.html(container, `
			<div>
				<h1>1</h1>
				<h1>2</h1>
				<span>X</span>
				<span>Y</span>
			</div>
		`)

		render(
			h('div',
				h('h1', 1),
				h('h1', 2)
			),
			container
		)

		assert.html(container, `
			<div>
				<h1>1</h1>
				<h1>2</h1>
			</div>
		`)
	})

	it('should render innerHTML with children', () => {
		let container = document.createElement('div')

		render(
			h('div', {innerHTML: '<span>X</span><span>Y</span>'},
				h('h1', 1),
				h('h1', 2)
			),
			container
		)

		assert.html(container, `
			<div>
				<h1>1</h1>
				<h1>2</h1>
				<span>X</span>
				<span>Y</span>
			</div>
		`)

		render(
			h('div',
				h('h1', 1),
				h('h1', 2)
			),
			container
		)

		assert.html(container, `
			<div>
				<h1>1</h1>
				<h1>2</h1>
			</div>
		`)
	})

	it('should set innerHTML', () => {
		let container = document.createElement('div')

		render(
			h('div', {innerHTML: '<span>X</span><span>Y</span>'}),
			container
		)

		assert.html(container, `<div><span>X</span><span>Y</span></div>`)
	})

	it('should remove undefine styles', () => {
		let container = document.createElement('div')

		render(h('div', {style: {color: 'red'}}), container)
		assert.html(container, '<div style="color: red;"></div>')

		render(h('div', {style: {color: undefined}}), container)
		assert.html(container, `<div style=""></div>`)
	})

	it('should handle invalid refs', () => {
		let container = document.createElement('div')

		assert.doesNotThrow(() => {
			render(h('div', {ref: null}), container)
			render(h('div', {ref: undefined}), container)
			render(h('div', {ref: 100}), container)
			render(h('div', {ref: Symbol('')}), container)
			render(h('div', {ref: {}}), container)
		})
	})

	it('should render tabIndex', () => {
		let container = document.createElement('div')

		render(h('svg', {tabIndex: 2}), container)
		assert.html(container, '<svg tabindex="2"></svg>')
	})

	it('should render children prop', () => {
		let container = document.createElement('div')

		render(h('div', {children: h('span')}), container)
		assert.html(container, '<div><span></span></div>')

		render(h('div', {children: [h('span'), h('hr')]}), container)
		assert.html(container, '<div><span></span><hr></div>')

		render(h('div', {children: [h('span'), h('hr'), h('h1', 1)]}), container)
		assert.html(container, '<div><span></span><hr><h1>1</h1></div>')

		render(h('div', {children: 'secondary'}, 'primary'), container)
		assert.html(container, '<div>primary</div>')
	})

	it('should no-op duplicate keys', () => {
		let container = document.createElement('div')

		render(h('div', [
			h('h1', {key: 1}),
			h('h2', {key: 1}),
			h('h3', {key: 2})
		]), container)

		render(h('div', [
			h('h1', {key: 1}),
			h('h2', {key: 1}),
			h('h3', {key: 2})
		]), container)

		assert.html(container, '<div><h1></h1><h2></h2><h3></h3></div>')
	})

	it('should mount into a document fragment', () => {
		var container = document.createElement('div')
		var fragment = document.createDocumentFragment()

		render(h('div', 'foo'), fragment)
		assert.html(container, '')

		container.appendChild(fragment)
		assert.html(container, '<div>foo</div>')
 	})

 	it('should render non-primitive attributes', () => {
 		let container = document.createElement('div')
 		let fn = () => {}

 		render(h('h1', {custom: {first: 1}}, '0'), container)
 		assert.html(container, '<h1>0</h1>')
 		assert.deepEqual(container.firstChild.custom, {first: 1})

 		render(h('h1', {custom: {first: 1, second: 2}}, '0'), container)
 		assert.html(container, '<h1>0</h1>')
 		assert.deepEqual(container.firstChild.custom, {first: 1, second: 2})

 		render(h('h1', {custom: null}, '0'), container)
 		assert.html(container, '<h1>0</h1>')
 		assert.equal(container.firstChild.custom, '')

 		render(h('h1', {custom: {first: 1}}, '0'), container)
 		assert.html(container, '<h1>0</h1>')
 		assert.deepEqual(container.firstChild.custom, {first: 1})

 		render(h('h1', {custom: fn}, '0'), container)
 		assert.html(container, '<h1>0</h1>')
 		assert.equal(container.firstChild.custom, fn)

 		render(h('h1', {custom: {first: 1, second: 2}}, '0'), container)
 		assert.html(container, '<h1>0</h1>')
 		assert.deepEqual(container.firstChild.custom, {first: 1, second: 2})
 	})
})
