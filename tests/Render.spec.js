module.exports = ({h, shallow, render}) => {
	test('Render', ({ok, end}) => {
		var iterable = {
			[Symbol.iterator]: function* () {
		    yield 1
		    yield 2
		    yield 3
			}
		}

		class Faz {
			render () {
				return h('h1', {id: 1}, '2')
			}
		}

		const Foo = () => h('h1', {id: 1}, '1')
		const Bar = () => iterable

		var container = document.createElement('div')

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

		console.log(container.innerHTML)

		// @TODO render fragments, portal, etc..

		end()
	});
}
