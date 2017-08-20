module.exports = ({h, render}) => {	
	test('Server', ({ok, end}) => {
		const Writable = new require('stream').Writable

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

		ok(`${h(Foo)}` === '<h1 class="faz" style="margin-top:20px;">Faz</h1>', 'Composite.toString()')
		ok(`${h(Faz)}` === '<h1 class="faz" style="margin-top:20px;">Faz</h1>', 'Component.toString()')
		ok(`${h('h1', 'Faz')}` === '<h1>Faz</h1>', 'Element.toString()')
		ok(`${h(Baz)}` === '<head></head><body></body>', 'Fragment.toString()')

		var output = ''
		var result = '<h1 class="foo">12<p>Hello</p><span></span><img></h1>'
		var element = [h('h1', {className: 'foo'}, 1, 2, h('p', 'Hello'), h('span'), h('img'))]

		var writable = Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})

		dio.renderToStream(element, writable, () => {
			ok(output === result, '#renderToStream(element, writable, callback)')

			output = ''
			writable = Writable({
			  write(chunk, encoding, callback) {
		      output += chunk.toString()
		      callback()
			  }
			})

			dio.renderToString(element, writable, () => {
				ok(output === result, '#renderToString(element, writable, callback)')
				ok(dio.renderToString(element) === result, '#renderToString(element)')

				end()
			})
		})
	})
}
