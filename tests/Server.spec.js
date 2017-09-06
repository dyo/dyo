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

		class Err {
			componentDidCatch(err) {
				err.report = ''
				return 'Hello'
			}
			render () {
				throw 'error'
			}
		}

		ok(`${h(Err)}` === 'Hello', 'Component#componentDidCatch')
		ok(`${h(Foo)}` === '<h1 class="faz" style="margin-top:20px;">Faz</h1>', 'Composite.toString()')
		ok(`${h(Faz)}` === '<h1 class="faz" style="margin-top:20px;">Faz</h1>', 'Component.toString()')
		ok(`${h('h1', {onClick: function () {}}, 'Faz')}` === '<h1>Faz</h1>', 'Element.toString()')
		ok(`${h(Baz)}` === '<head></head><body></body>', 'Fragment.toString()')

		var output = ''
		var result = '<h1 class="foo">12<p>Hello</p><span></span><img></h1>'
		var element = [h('h1', {className: 'foo'}, 1, 2, h('p', 'Hello'), h('span'), h('img'))]

		var jsonComposite = '{"type":"h1","props":{"className":"faz","style":{"marginTop":"20px"}},"children":["Faz"]}'
		var jsonElement = '{"type":"h1","props":{},"children":["Faz"]}'
		var jsonComponent = '{"type":"h1","props":{"className":"faz","style":{"marginTop":"20px"}},"children":["Faz"]}'
		var jsonFragment = '[{"type":"head","props":{},"children":[]},{"type":"body","props":{},"children":[]}]'

		ok(JSON.stringify(h(Foo)) === jsonComposite, 'Composite.toJSON')
		ok(JSON.stringify(h(Faz)) === jsonComponent, 'Component.toJSON')
		ok(JSON.stringify(h('h1', 'Faz')) === jsonElement, 'Element.toJSON')
		ok(JSON.stringify(h(Baz)) === jsonFragment, 'Fragment.toJSON')

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
