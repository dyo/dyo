describe('Factory', () => {
	let parent = {}
	let container = {}

	let setDocument = (element) => {
		element.owner.toString = () => element.children.toString()
		element.owner.toJSON = () => element.children.toJSON()
	}

	let setComment = (element, value) => {}
	let setText = (element, value) => {}
	let setProps = (element, name, value, xmlns) => {}

	let getOwner = () => { return element.owner }
	let getDocument = () => { return parent }
	let getTarget = (event) => { return {} }
	let getType = (element, xmlns) => { return xmlns }
	let getProps = (element) => { return element.props }
	let getPortal = (element, container) => { return {} }
	let getQuery = (element, parent, previous, next) => { return null }

	let isValidTarget = (node) => { return node instanceof Object }
	let isValidEvent = (event) => { return event instanceof Object }

	let removeChild = (element, parent) => {}
	let insertChild = (element, sibling, parent) => {}
	let appendChild = (element, parent) => {}

	let createElement = (element) => { return {} }
	let createText = (element) => { return {} }
	let createEmpty = (element) => { return {} }
	let createComponent = (element) => { return {} }

	let config = {
		setDocument,
		setComment,
		setText,
		setProps,
		getDocument,
		getTarget,
		getType,
		getPortal,
		getQuery,
		isValidTarget,
		isValidEvent,
		removeChild,
		insertChild,
		appendChild,
		createElement,
		createText,
		createEmpty,
		createComponent
	}

	let renderer
	let render
	let unmountComponentAtNode
	let renderToNodeStream

	it('should create an element factory', () => {
		let A = () => {}
		let factory = createFactory('h1')
		let element = factory({id: 'id'}, '1')

		assert.propertyVal(createFactory(A)(), 'type', A)

		assert.propertyVal(element, 'type', 'h1')
		assert.propertyVal(element.props, 'id', 'id')
		assert.propertyVal(element.children.next, 'children', '1')
	})

	it('should create a render factory', () => {
		let stack = []

		assert.deepEqual(Object.keys(
			createFactory({})
		), [
			'version',
			'render',
			'hydrate',
			'Component',
			'Fragment',
			'PureComponent',
			'Children',
			'createContext',
			'createFactory',
			'cloneElement',
			'isValidElement',
			'createPortal',
			'createElement',
			'createComment',
			'createClass',
			'unmountComponentAtNode',
			'findDOMNode',
			'h',
			'renderToString',
			'renderToNodeStream'
		])
	})

	it('should create noop renderer', () => {
		renderer = createFactory(config)
		render = renderer.render
		unmountComponentAtNode = renderer.unmountComponentAtNode
		renderToNodeStream = renderer.renderToNodeStream

		assert.notEqual(render, undefined)
		assert.notEqual(unmountComponentAtNode, undefined)
		assert.notEqual(renderToNodeStream, undefined)
	})

	it('should validate elements cross realm', () => {
		assert.isTrue(renderer.isValidElement(h('div')))
		assert.isTrue(isValidElement(renderer.h('div')))
	})

	it('should render null', () => {
		render(null, container)
		assert.html(container, '')
	})

	it('should render text', () => {
		render('hello', container)
		assert.html(container, 'hello')
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

	it('should render a iteratable', () => {
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

	it('should render a array', () => {
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

	it('should render nested array children', () => {
		render(h('div', 1, [2, 3, [4, 5]]), container)
		assert.html(container, `<div>12345</div>`)
	})

	it('should render and update styles', () => {
		render(h('div', {style: {color: 'red'}}), container)
		render(h('div', {style: {color: 'blue'}}), container)
		assert.html(container, '<div style="color: blue;"></div>')
	})

	it('should not render to an invalid container', () => {
		assert.throws(() => {
			render('1', true)
		})
	})

	it('should execute render callback', () => {
		let container = {}
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

	it('should render a component stream to a stream', (done) => {
		let writable = new require('stream').Writable({
			write(chunk, encoding, callback) {
				output += chunk.toString()
				callback()
			}
		})

		let element = h(class {
			getInitialState() {
				return {x: '!'}
			}
			render(props, {x}) {
				return h('h1', 'Hello World', x)
			}
		})
		let output = ''

		render(element, container)
		renderToNodeStream(element, writable, () => {
			assert.html(output, '<h1>Hello World!</h1>')
			done()
		})
	})

	it('should render a component string to json', () => {
		let container = {}
		let element = h(class {
			render() {
				return '1'
			}
		})

		render(element, container)
		assert.json(container, '"1"')
	})

	let List = class {
		render ({type}) {
			return h('ul',
				this.props.data.map(v => h(type, {key: v}, v))
			)
		}
	}

	it('[simple] - 1 -> 1, 2, 3, 4', () => {
		render(h(List, {type: 'li', data: [1]}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 4]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
			</ul>
		`)
	})

	it('[simple] - | -> 1, 2, 3, 4', () => {
		render(h(List, {type: 'li', data: []}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 4]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
			</ul>
		`)
	})

	it('[simple] - 1 -> 4, 3, 2, 1', () => {
		render(h(List, {type: 'li', data: [1]}), container)
		render(h(List, {type: 'li', data: [4, 3, 2, 1]}), container)

		assert.html(container, `
			<ul>
				<li>4</li>
				<li>3</li>
				<li>2</li>
				<li>1</li>
			</ul>
		`)
	})

	it('[simple] - 1, 2 -> 2, 1', () => {
		render(h(List, {type: 'li', data: [1, 2]}), container)
		render(h(List, {type: 'li', data: [2, 1]}), container)

		assert.html(container, `
			<ul>
				<li>2</li>
				<li>1</li>
			</ul>
		`)
	})

	it('[simple] - 1, 2, 3 -> 3, 2, 1', () => {
		render(h(List, {type: 'li', data: [1, 2, 3]}), container)
		render(h(List, {type: 'li', data: [3, 2, 1]}), container)

		assert.html(container, `
			<ul>
				<li>3</li>
				<li>2</li>
				<li>1</li>
			</ul>
		`)
	})

	it('[simple] - 1, 2, 3, 4, 5, 6 -> 6, 2, 3, 4, 5, 1', () => {
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)
		render(h(List, {type: 'li', data: [6, 2, 3, 4, 5, 1]}), container)

		assert.html(container, `
			<ul>
				<li>6</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>1</li>
			</ul>
		`)
	})

	it('[simple] - a, b, c, d, e, q, f, g -> a, b, f, d, c, g', () => {
		render(h(List, {type: 'li', data: ['a', 'b', 'c', 'd', 'e', 'q', 'f', 'g']}), container)
		render(h(List, {type: 'li', data: ['a', 'b', 'f', 'd', 'c', 'g']}), container)

		assert.html(container, `
			<ul>
				<li>a</li>
				<li>b</li>
				<li>f</li>
				<li>d</li>
				<li>c</li>
				<li>g</li>
			</ul>
		`)
	})

	it('[simple] - w, g, c, f, d, b, a, z -> w, a, b, f, d, c, g, z', () => {
		render(h(List, {type: 'li', data: ['w', 'g', 'c', 'f', 'd', 'b', 'a', 'z']}), container)
		render(h(List, {type: 'li', data: ['w', 'a', 'b', 'f', 'd', 'c', 'g', 'z']}), container)

		assert.html(container, `
			<ul>
				<li>w</li>
				<li>a</li>
				<li>b</li>
				<li>f</li>
				<li>d</li>
				<li>c</li>
				<li>g</li>
				<li>z</li>
			</ul>
		`)
	})

	it('[simple] - 1, 2, 3, 4, 5 -> 6, 7, 8, 9, 10, 11', () => {
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5]}), container)
		render(h(List, {type: 'li', data: [6, 7, 8, 9, 10, 11]}), container)

		assert.html(container, `
			<ul>
				<li>6</li>
				<li>7</li>
				<li>8</li>
				<li>9</li>
				<li>10</li>
				<li>11</li>
			</ul>
		`, '')
	})

	it('[simple] - 1, 5 -> 1, 2, 3, 4, 5', () => {
		render(h(List, {type: 'li', data: [1, 5]}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
			</ul>
		`)
	})

	it('[simple] - 1, 2, 5, 6, 7 -> 1, 2, 3, 4, 5, 6', () => {
		render(h(List, {type: 'li', data: [1, 2, 5, 6, 7]}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`)
	})

	it('[simple] - 1, 2, 3, 4, 5, 6 -> 1, 2, 4, 5, 6', () => {
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)
		render(h(List, {type: 'li', data: [1, 2, 4, 5, 6]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`)
	})

	it('[complex] - 1, 2, 3, 4, 5, 6 -> 1, 40, 0, 3, 4, 2, 5, 6, 60', () => {
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)
		render(h(List, {type: 'li', data: [1, 40, 0, 3, 4, 2, 5, 6, 60]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>40</li>
				<li>0</li>
				<li>3</li>
				<li>4</li>
				<li>2</li>
				<li>5</li>
				<li>6</li>
				<li>60</li>
			</ul>
		`)
	})

	it('[complex] - 1, 40, 0, 3, 4, 2, 5, 6, 60 -> 1, 2, 3, 0, 5, 6, 90, 4', () => {
		render(h(List, {type: 'li', data: [1, 40, 0, 3, 4, 2, 5, 6, 60]}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 0, 5, 6, 90, 4]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>0</li>
				<li>5</li>
				<li>6</li>
				<li>90</li>
				<li>4</li>
			</ul>
		`)
	})

	it('[complex] - 0, 2, 4, 6, 8 -> 0, 1, 2, 3, 4, 5, 6, 7, 8', () => {
		render(h(List, {type: 'li', data: [0, 2, 4, 6, 8]}), container)
		render(h(List, {type: 'li', data: [0, 1, 2, 3, 4, 5, 6, 7, 8]}), container)

		assert.html(container, `
			<ul>
				<li>0</li>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
				<li>7</li>
				<li>8</li>
			</ul>
		`)
	})

	it('[complex] - 1, 40, 0, 3, 4, 2, 5, 6, 60 -> 1, 2, 3, 4, 5, 6', () => {
		render(h(List, {type: 'li', data: [1, 40, 0, 3, 4, 2, 5, 6, 60]}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`)
	})

	it('[complex] - a, b, d, f, c -> c, b, d, r, a', () => {
		render(h(List, {type: 'li', data: ['a', 'b', 'd', 'f', 'c']}), container)
		render(h(List, {type: 'li', data: ['c', 'b', 'd', 'r', 'a']}), container)

		assert.html(container, `
			<ul>
				<li>c</li>
				<li>b</li>
				<li>d</li>
				<li>r</li>
				<li>a</li>
			</ul>
		`)
	})

	it('[complex] - 1, 40, 0, 4, 2, 5, 6, 60 -> 1, 2, 4, 5, 6', () => {
		let A = class {
			render({children}) {
				return h('li', children)
			}
		}

		render(h(List, {type: A, data: [1, 40, 0, 4, 2, 5, 6, 60]}), container)
		render(h(List, {type: A, data: [1, 2, 4, 5, 6]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`)
	})

	it('should change updating props', () => {
		let container = document.createElement('div')
		let stack = []
		let renderer = createFactory({
			getUpdatedProps: function (element, props) {
				stack.push('update', props)
				return {}
			}
		})

		renderer.render(h('h1', {id: 1, class: 'first'}, 'Hello World'), container)
		assert.html(container, `<h1 id="1" class="first">Hello World</h1>`)

		renderer.render(h('h1', {id: 1, class: 'second'}, 'Hello World'), container)
		assert.html(container, `<h1 id="1" class="first">Hello World</h1>`)
		assert.deepEqual(stack, ['update', {class: 'second'}])
	})

	it('should ensure the signature arguments passed to setProps', () => {
		let container = document.createElement('div')
		let stack = []
		let renderer = createFactory({
			setProps: function (element, value, name, xmlns, signature) {
				if (signature === 0)
					stack.push('phase:mount')
				else
					stack.push('phase:update')
			}
		})

		renderer.render(h('h1', {id: 1}, 'Hello World'), container)
		assert.html(container, `<h1>Hello World</h1>`)
		assert.deepEqual(stack, ['phase:mount'])

		renderer.render(h('h1', {id: 2}, 'Hello World'), container)
		assert.html(container, `<h1>Hello World</h1>`)
		assert.deepEqual(stack, ['phase:mount', 'phase:update'])
	})

	it('should provide a default root context', () => {
		let container = document.createElement('div')
		let stack = []
		let renderer = createFactory({
			getContext: function () {
				return {children: 'Hello World'}
			}
		})

		class A {
			render(props, state, {children}) {
				return children
			}
		}

		renderer.render(h(A), container)
		assert.html(container, `Hello World`)
	})

	it('should invoke willUnmount when unmounting', () => {
		let container = document.createElement('div')
		let stack = []
		let renderer = createFactory({
			willUnmount: function (element, parent, host) {
				stack.push(
					`element:${element.type}:${isValidElement(element)}`,
					`parent:${parent.type}:${isValidElement(parent)}`,
					`host:${host === element}`
				)
			}
		})

		renderer.render(h('h1', h('h2', h('h3'))), container)
		assert.html(container, `<h1><h2><h3></h3></h2></h1>`)
		assert.lengthOf(stack, 0)

		renderer.render(null, container)
		assert.html(container, ``)
		assert.deepEqual(stack, [
			'element:h3:true', 'parent:h2:true', 'host:false',
			'element:h2:true', 'parent:h1:true', 'host:false',
			'element:h1:true', 'parent:null:true', 'host:true',
		])
	})
})
