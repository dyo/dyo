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

		ok(dio.renderToString(Foo) === '<h1>Faz</h1>', 'render composite');
		ok(dio.renderToString(Faz) === '<h1>Faz</h1>', 'render component');
		ok(dio.renderToString(h('h1', 'Faz')) === '<h1>Faz</h1>', 'render element');
		ok(h('h1', 'Faz').toString() === '<h1>Faz</h1>', 'render toString');
		ok(dio.renderToString('Hello') === 'Hello' && dio.renderToString(1) === '1', 'render text');

		const destination = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString();
	      callback();
		  }
		});

		var output = '';
		var source = dio.renderToStream(h('h1', 1, 2, h('p', 'Hello'), h('span'), h('img')));

		source.pipe(destination);

		source.on('end', () => {
			ok(output === '<h1>12<p>Hello</p><span></span><img></h1>', 'render stream');
			end();
		});

		function foo () {
			return h('h1', 'Hello');
		}

		console.log(
			dio.renderToCache(h(foo)),
			dio.renderToCache(h(foo)),
			dio.renderToCache(h(foo))
		)
	});
}
