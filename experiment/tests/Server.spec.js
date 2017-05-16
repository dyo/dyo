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

		ok(`${h(Foo)}` === '<h1>Faz</h1>', 'render composite');
		ok(`${h(Faz)}` === '<h1>Faz</h1>', 'render component');
		ok(`${h('h1', 'Faz')}` === '<h1>Faz</h1>', 'render element');

		const destination = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString();
	      callback();
		  }
		});

		var output = '';
		var element = h('h1', 1, 2, h('p', 'Hello'), h('span'), h('img'))

		dio.render(element, destination).on('end', () => {
			ok(output === '<h1>12<p>Hello</p><span></span><img></h1>', 'render stream');
			end();
		});

		function foo () {
			return h('h1', 'Hello');
		}
	});
}
