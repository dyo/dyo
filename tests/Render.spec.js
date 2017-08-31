module.exports = ({h, render}) => {
	test('Render', ({ok, end}) => {
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

		const Foo = () => h('h1', {id: 1}, '1')
		const Bar = () => iterable
		const Baz = () => [h('h1', 'Hello'), h('h1', 'World')]

		var container = document.createElement('div')
		var portal = document.createElement('div')

		render(h('h1', {dangerouslySetInnerHTML: {__html: '<div>test</div>'}}), container)
		ok(compare(container, '<h1><div>test</div></h1>'), 'render element dangerouslySetInnerHTML')
		
		render(null, container)
		ok(container.innerHTML === '', 'render null')

		render('hello', container)
		ok(compare(container, 'hello'), 'render text')

		render(h('h1', {className: 1}, '0'), container)
		ok(compare(container, '<h1 class="1">0</h1>'), 'render element className')

		render(h('h1', {className: undefined}, '0'), container)
		ok(compare(container, '<h1>0</h1>'), 'render element property(undefined)')

		render(h('h1', {className: null}, '0'), container)
		ok(compare(container, '<h1>0</h1>'), 'render element property(null)')

		render(h('h1', {class: 1}, '0'), container)
		ok(compare(container, '<h1 class="1">0</h1>'), 'render element class')

		render(h('h1', {style: {width: '100px'}}, '0'), container)
		ok(container.firstChild.style.width === '100px', 'render element style object')
		
		render(h('h1', {style: 'width:100px'}, '0'), container)
		ok(container.firstChild.style.width === '100px', 'render element style string')

		render(h('img', {width: '100px'}), container)
		ok(container.firstChild.getAttribute('width') === '100px', 'render element img width')

		render(h(Foo), container);
		ok(compare(container, '<h1 id="1">1</h1>'), 'render function')

		render((Faz), container)
		ok(compare(container, '<h1 id="1">2</h1>'), 'render class')

		render(Bar, container)
		ok(compare(container, '123'), 'render iteratable')

		render(Baz, container)
		ok(compare(container, '<h1>Hello</h1><h1>World</h1>'), 'render fragment')

		render([h('h1', 'Hello'), h(portal, h('h1', 'World'))], container)
		ok(compare(container, '<h1>Hello</h1>') && compare(portal, '<h1>World</h1>'), 'render portal')

		render(null, container)
		render(Boo, container)

		promise.then(() => {
			ok(container.innerHTML === '<h1>Promise</h1>', 'render promise')
			end()
		})
	})
}
