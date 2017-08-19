module.exports = ({h, render}) => {	
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
				return h('h1', {className: 'faz', style: {marginTop: '20px'}}, 'Faz')
			}
		}

		class Baz {
			render() {
				return [h('head'), h('body')]
			}
		}

		ok(`${h(Foo)}` === '<h1 class="faz" style="margin-top:20px;">Faz</h1>', 'render composite')
		ok(`${h(Faz)}` === '<h1 class="faz" style="margin-top:20px;">Faz</h1>', 'render component')
		ok(`${h('h1', 'Faz')}` === '<h1>Faz</h1>', 'render element')
		ok(`${h(Baz)}` === '<head></head><body></body>', 'render fragment')

		var output = ''
		var element = [h('h1', 1, 2, h('p', 'Hello'), h('span'), h('img'))]
		var destination = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})

		dio.render(element, destination).on('end', () => {
			ok(output === '<h1>12<p>Hello</p><span></span><img></h1>', 'render stream')
			end()
		})
	})
}
