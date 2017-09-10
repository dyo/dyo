test('Render', ({assert, done}) => {
	var iterable = {
		[Symbol.iterator]: function* () {
	    yield 1
	    yield 2
	    yield 3
		}
	}

	var promise = Promise.resolve(h('h1', 'Promise'))

	class Faz {
		render () {
			return h('h1', {id: 1}, '2')
		}
	}

	class Boo {
		render() {
			return h(promise, h('h1', 'Loading...'))
		}
	}

	class Fooly {
		render() {
			return h(Cooly, {
				ref: (value) => {
					if (value)
						assert(value instanceof Cooly, 'ref function(instance#mount)')
					else
						assert(value === null, 'ref function(instance#unmount)')
				} 
			})
		}
	}

	class Cooly {
		componentDidMount() {
			assert(this.refs.wooly instanceof Wooly, 'ref string(instance#mount)')
		}
		render() {
			return h(Wooly, {
				ref: 'wooly'
			})
		}
	}

	class Wooly {
		componentWillUnmount() {
			Promise.resolve().then(()=>{
				assert(this.refs.heading === null, 'ref string(node#unmount)')
			})
		}
		componentDidMount() {
			assert(this.refs.heading.nodeType, 'ref string(node#mount)')
		}
		render() {
			return h('div', {
				ref: (value) => {
					if (value)
						assert(value.nodeType, 'ref function(node#mount)')
					else
						assert(value === null, 'ref function(node#unmount)')
				}
			}, h('h1', {ref: 'heading'}))
		}
	}

	const Foo = () => h('h1', {id: 1}, '1')
	const Bar = () => iterable
	const Baz = () => [h('h1', 'Hello'), h('h1', 'World')]

	var container = document.createElement('div')
	var portal = document.createElement('div')

	render(Fooly, container)

	render(h('h1', {dangerouslySetInnerHTML: {__html: '<div>test</div>'}}), container)
	assert(compare(container, '<h1><div>test</div></h1>'), 'render element dangerouslySetInnerHTML')
	
	render(null, container)
	assert(container.innerHTML === '', 'render null')

	render('hello', container)
	assert(compare(container, 'hello'), 'render text')

	render(h('h1', {className: undefined}, '0'), container)
	assert(compare(container, '<h1>0</h1>'), 'render element property(undefined)')

	render(h('h1', {prop: null}, '0'), container)
	assert(compare(container, '<h1>0</h1>'), 'render element property(null)')

	render(h('h1', {class: 1}, '0'), container)
	assert(compare(container, '<h1 class="1">0</h1>'), 'render element class')

	render(h('h1', {className: 2}, '0'), container)
	assert(compare(container, '<h1 class="2">0</h1>'), 'render element className')

	render(h('input', {value: undefined}, '0'), container)
	assert(compare(container, '<input>'), 'render undefined prop')

	render(h('h1', {style: {width: '100px'}}, '0'), container)
	assert(container.firstChild.style.width === '100px', 'render element style object')
	
	render(h('h1', {style: 'width:100px'}, '0'), container)
	assert(container.firstChild.style.width === '100px', 'render element style string')

	render(h('img', {width: '100px'}), container)
	assert(container.firstChild.getAttribute('width') === '100px', 'render element img width')

	render(h(Foo), container);
	assert(compare(container, '<h1 id="1">1</h1>'), 'render function')

	render((Faz), container)
	assert(compare(container, '<h1 id="1">2</h1>'), 'render class')

	render(Bar, container)
	assert(compare(container, '123'), 'render iteratable')

	render(Baz, container)
	assert(compare(container, '<h1>Hello</h1><h1>World</h1>'), 'render fragment')

	render([h('h1', 'Hello'), h(portal, h('h1', 'World'))], container)
	assert(compare(container, '<h1>Hello</h1>') && compare(portal, '<h1>World</h1>'), 'render portal')

	render(null, container)
	render(Boo, container)

	promise.then(() => {
		assert(container.innerHTML === '<h1>Promise</h1>', 'render promise')
		done()
	})
})
