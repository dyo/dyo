module.exports = ({h, shallow, render}) => {
	test('Shallow', ({ok, end}) => {
		class Foo {
			render () {
				return h('h1', 1);
			}
		}

		function Bar () {
			return h('h1', 1);
		}

		class Faz {
			render () {
				return Bar;
			}
		}

		var el = h('h1', 1);
		var fn = h(Bar);
		var cl = h(Foo);

		var els = shallow(el);
		var fns = shallow(fn);
		var cls = shallow(cl);
		var com = shallow(Faz);

		ok(els.tag === 'h1' && els.children[0].children === 1, 'shallow element');
		ok(fns.tag === 'h1' && fns.children[0].children === 1, 'shallow function');
		ok(cls.tag === 'h1' && cls.children[0].children === 1, 'shallow class');
		ok(com.tag === 'section' && com.children[0].type === Bar, 'shallow composite');
		end();
	});

	test('Render', ({ok, end}) => {
		var elem = h('h1', {id: 1}, '0');

		class Faz {
			render () {
				return h('h1', {id: 1}, '2');
			}
		}

		const Foo = () => h('h1', {id: 1}, '1');

		const Resolve = () => {
			return new Promise((resolve) => {
				resolve(h('h1', {id: 1}, '3'));
				setTimeout(() => {
					ok(container.innerHTML === '<h1 id="1">3</h1>', 'render async');
					end();
				})
			});
		}

		class Coroutine {
			*render() {
				var supply = 0;
				while (true) {
					yield ++supply;
				}
			}
		}

		var comp1 = h(Foo);
		var comp2 = h(Faz);

		var container = document.createElement('div');

		render(elem, container);
		ok(container.innerHTML === '<h1 id="1">0</h1>', 'render element');

		render(comp1, container);
		ok(container.innerHTML === '<h1 id="1">1</h1>', 'render function');

		render(comp2, container);
		ok(container.innerHTML === '<h1 id="1">2</h1>', 'render class');

		render(null, container);
		ok(container.innerHTML === '', 'render null');

		render('hello', container);
		ok(container.innerHTML === 'hello', 'render text');

		render(Coroutine, container);
		ok(container.innerHTML === '1', 'render coroutine');

		render(Resolve, container);
	});
}
