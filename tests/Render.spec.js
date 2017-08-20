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

		render(h('h1', {id: 1}, '0'), container);
		ok(container.innerHTML === '<h1 id="1">0</h1>', 'render element')

		render(h(Foo), container);
		ok(container.innerHTML === '<h1 id="1">1</h1>', 'render function')

		render((Faz), container)
		ok(container.innerHTML === '<h1 id="1">2</h1>', 'render class')

		render(null, container)
		ok(container.innerHTML === '', 'render null')

		render('hello', container)
		ok(container.innerHTML === 'hello', 'render text')


		render(Bar, container)
		ok(container.innerHTML === '123', 'render iteratable')

		render(Baz, container)
		ok(container.innerHTML === '<h1>Hello</h1><h1>World</h1>', 'render fragment')

		render([h('h1', 'Hello'), h(portal, h('h1', 'World'))], container)
		ok(container.innerHTML === '<h1>Hello</h1>' && portal.innerHTML === '<h1>World</h1>', 'render portal')

		render(null, container)
		render(Boo, container)

		promise.then(() => {
			ok(container.innerHTML === '<h1>Promise</h1>', 'render promise')
			end()
		})
	})
}
