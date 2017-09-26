describe('Server', () => {
	it('should catch errors', () => {
		let error = null
		assert.html(h(class {
			componentDidCatch(err) {
				err.preventDefault()
				error = err
			}
			render () {
				throw new Error('Error!')
			}
		}).toString(), '')

		assert.instanceOf(error, Error)
	})

	it('should render an element to string', () => {
		assert.html(
			h('h1', {className: 'faz', style: {marginTop: '20px'}}, 'Faz'), 
			`<h1 class="faz" style="margin-top:20px;">Faz</h1>`
		)
	})

	it('should not render event props to string', () => {
		assert.html(h('h1', {onClick: () => {}}, 'Faz'), '<h1>Faz</h1>')
	})

	it('should not render key props to string', () => {
		assert.html(h('h1', {key: 1}, 'Faz'), '<h1>Faz</h1>')
	})

	it('should not render children props to string', () => {
		assert.html(h('h1', {children: 'Faz'}), '<h1>Faz</h1>')
	})

	it('should render a fragment to string', () => {
		assert.html(
			h(class {
				render() {
					return [h('head'), h('body')]
				}
			}), 
			'<head></head><body></body>'
		)
	})

	it('should render a portal to string', () => {
		assert.html(
			h(class {
				render() {
					return h('div', createPortal(h('div', {class: 'modal'}), 'body'))
				}
			}), 
			'<div><div class="modal"></div></div>'
		)
	})

	it('should render void elements to a string', () => {
		assert.html(h('area'), '<area>')
		assert.html(h('base'), '<base>')
		assert.html(h('br'), '<br>')
		assert.html(h('meta'), '<meta>')
		assert.html(h('source'), '<source>')
		assert.html(h('keygen'), '<keygen>')
		assert.html(h('img'), '<img>')
		assert.html(h('col'), '<col>')
		assert.html(h('embed'), '<embed>')
		assert.html(h('track'), '<track>')
		assert.html(h('param'), '<param>')
		assert.html(h('link'), '<link>')
		assert.html(h('input'), '<input>')
		assert.html(h('hr'), '<hr>')
		assert.html(h('!doctype'), '<!doctype>')

		assert.html(h('AREA'), '<AREA>')
		assert.html(h('BASE'), '<BASE>')
		assert.html(h('BR'), '<BR>')
		assert.html(h('META'), '<META>')
		assert.html(h('SOURCE'), '<SOURCE>')
		assert.html(h('AREA'), '<AREA>')
		assert.html(h('KEYGEN'), '<KEYGEN>')
		assert.html(h('IMG'), '<IMG>')
		assert.html(h('COL'), '<COL>')
		assert.html(h('EMBED'), '<EMBED>')
		assert.html(h('TRACK'), '<TRACK>')
		assert.html(h('PARAM'), '<PARAM>')
		assert.html(h('LINK'), '<LINK>')
		assert.html(h('INPUT'), '<INPUT>')
		assert.html(h('HR'), '<HR>')
		assert.html(h('!DOCTYPE'), '<!DOCTYPE>')
	})

	it('should render a string to string', () => {
		assert.html(
			h(class {
				render() {
					return '1'
				}
			}), 
			'1'
		)
	})

	it('should render an element to json', () => {
		assert.json(
			h('h1', {className: 'faz', style: {marginTop: '20px'}}, 'Faz'), 
			`{"type":"h1","props":{"className":"faz","style":{"marginTop":"20px"}},"children":["Faz"]}`
		)
	})

	it('should render an fragment to json', () => {
		assert.json(
			h(class {
				render() {
					return [h('head'), h('body')]
				}
			}), 
			`[{"type":"head","props":{},"children":[]},{"type":"body","props":{},"children":[]}]`
		)
	})

	it('should render a string to json', () => {
		assert.json(
			h(class {
				render() {
					return '1'
				}
			}), 
			'"1"'
		)
	})

	it('should render element string', () => {
		let element = [h('h1', {className: 'foo'}, 1, 2, h('p', 'Hello'), h('span'), h('img'))]

		assert.html(renderToString(element), `
			<h1 class="foo">
				12
				<p>Hello</p>
				<span></span>
				<img>
			</h1>
		`)
	})

	it('should render element string to a stream', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})
		let element = [h('h1', {className: 'foo'}, 1, 2, h('p', 'Hello'), h('span'), h('img'))]
		let output = ''

		renderToString(element, writable, () => {
			assert.html(output, `
				<h1 class="foo">
					12
					<p>Hello</p>
					<span></span>
					<img>
				</h1>
			`)

			done()
		})
	})

	it('should render element stream to a stream', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})

		let element = [h('h1', {className: 'foo'}, 1, 2, h('p', 'Hello'), h('span'), h('img'))]
		let output = ''

		renderToNodeStream(element, writable, () => {
			assert.html(output, `
				<h1 class="foo">
					12
					<p>Hello</p>
					<span></span>
					<img>
				</h1>
			`)

			done()
		})
	})

	it('should render an async element stream to stream', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})

		let element = Promise.resolve([h('h1', {className: 'foo'}, 1, 2, h('p', 'Hello'), h('span'), h('img'))])
		let output = ''

		renderToNodeStream(element, writable, () => {
			assert.html(output, `
				<h1 class="foo">
					12
					<p>Hello</p>
					<span></span>
					<img>
				</h1>
			`)

			done()
		})
	})

	it('should render an async component stream to a stream', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})

		let element = h(class {
			getInitialState() {
				return Promise.resolve({x: '!'})
			}
			render(props, {x}) {
				return h('h1', 'Hello World', x)
			}
		})
		let output = ''

		renderToNodeStream(element, writable, () => {
			assert.html(output, '<h1>Hello World!</h1>')
			done()
		})
	})

	it('should render a component stream to a stream', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})

		let element = h(class {
			getInitialState() {
				return {x: '!'}
			}
			render(props, {x}) {
				return h('h1', 'Hello World', x)
			}
		})
		let output = ''

		renderToNodeStream(element, writable, () => {
			assert.html(output, '<h1>Hello World!</h1>')
			done()
		})
	})

	it('should render element to a stream manually', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})
		let element = h('div', {dangerouslySetInnerHTML: {__html: '1'}})
		let output = ''
		let renderer = renderToNodeStream(element)

		renderer.on('end', () => {
			assert.html(output, `<div>1</div>`)
			done()
		})

		renderer.pipe(writable)
	})

	it('should render setHeader on response stream', (done) => {
		let stack = []
		let Writable = new require('stream').Writable
		let writable = Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})
		writable.setHeader = () => stack.push(1)
		writable.getHeader = () => false

		let element = h('div', {dangerouslySetInnerHTML: {__html: '1'}})
		let output = ''
		let renderer = renderToNodeStream(element, writable, () => {
			assert.html(output, `<div>1</div>`)
			assert.lengthOf(stack, 1)
			done()
		})

		assert.instanceOf(renderer, Writable)
	})

	it('should render dangerouslySetInnerHTML to a stream', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})
		let element = h('div', {dangerouslySetInnerHTML: {__html: '1'}})
		let output = ''

		renderToNodeStream(element, writable, () => {
			assert.html(output, `<div>1</div>`)
			done()
		})
	})

	it('should render dangerouslySetInnerHTML', () => {
		assert.html(h('div', {
			dangerouslySetInnerHTML: {__html: '1'}
		}), '<div>1</div>')
	})

	it('should not render dangerouslySetInnerHTML', () => {
		assert.html(h('div', {
			dangerouslySetInnerHTML: {}
		}), '<div></div>')

		assert.html(h('div', {
			dangerouslySetInnerHTML: undefined
		}), '<div></div>')
	})

	it('should render defaultValue', () => {
		assert.html(h('input', {
			defaultValue: 1
		}), '<input value="1">')
	})

	it('should not render defaultValue', () => {
		assert.html(h('input', {
			defaultValue: 1,
			value: '2'
		}), '<input value="2">')
	})

	it('should render acceptCharset', () => {
		assert.html(h('meta', {
			acceptCharset: true
		}), '<meta accept-charset>')
	})

	it('should render httpEquiv', () => {
		assert.html(h('meta', {
			httpEquiv: true
		}), '<meta http-equiv>')
	})

	it('should render booleans', () => {
		assert.html(h('meta', {
			show: true,
			hidden: false
		}), '<meta show>')
	})

	it('should escape test', () => {
		assert.html(h('div', 'a<>"\'&b'), '<div>a&lt;&gt;&quot;&#x27;&amp;b</div>')
	})
})
