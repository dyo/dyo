module.exports = ({h, shallow, render}) => {
	test('Server', ({ok, end}) => {
		class Foo {
			render () {
				return Bar
			}
		}

		class Bar {
			render() {
				return Faz
			}
		}

		class Faz {
			render() {
				return h('h1', 'Faz')
			}
		}

		ok(dio.renderToString(Foo) === '<h1 slot>Faz</h1>', 'render composite');
		ok(dio.renderToString(Faz) === '<h1 slot>Faz</h1>', 'render component');
		ok(dio.renderToString(h('h1', 'Faz')) === '<h1 slot>Faz</h1>', 'render element');
		ok(h('h1', 'Faz').toString() === '<h1>Faz</h1>', 'render element.toString');
		ok(dio.renderToString('Hello') === 'Hello' && dio.renderToString(1) === '1', 'render text');

		end();
	});
}
