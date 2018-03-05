describe('Server', () => {
	it('should render an element to string', () => {
		assert.html(
			h('h1', {className: 'faz'}, 'Faz'),
			`<h1 class="faz">Faz</h1>`
		)
	})

	it('should render an element style(object) to string', () => {
		assert.html(
			h('h1', {style: {marginTop: '20px'}}, 'Faz'),
			`<h1 style="margin-top: 20px;">Faz</h1>`
		)

		assert.html(
			h('h1', {style: {color: 'red'}}, 'Faz'),
			`<h1 style="color: red;">Faz</h1>`
		)

		assert.html(
			h('h1', {style: {lineHeight: 100}}, 'Faz'),
			`<h1 style="line-height: 100;">Faz</h1>`
		)

		assert.html(
			h('h1', {style: {color: undefined}}, 'Faz'),
			`<h1 style="">Faz</h1>`
		)

		assert.html(
			h('h1', {style: {color: null}}, 'Faz'),
			`<h1 style="">Faz</h1>`
		)

		assert.html(
			h('h1', {style: {color: false}}, 'Faz'),
			`<h1 style="">Faz</h1>`
		)

		assert.html(
			h('h1', {style: {color: true}}, 'Faz'),
			`<h1 style="">Faz</h1>`
		)

		assert.html(
			h('h1', {style: {color: {}}}, 'Faz'),
			`<h1 style="">Faz</h1>`
		)
	})

	it('should render an element style(string) to string', () => {
		assert.html(
			h('h1', {className: 'faz', style: 'margin-top:20px;'}, 'Faz'),
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

	it('should render defaultValue to string', () => {
		assert.html(h('input', {
			defaultValue: 1
		}), '<input value="1">')
	})

	it('should not render defaultValue to string', () => {
		assert.html(h('input', {
			defaultValue: 1,
			value: '2'
		}), '<input value="2">')
	})

	it('should render acceptCharset to string', () => {
		assert.html(h('meta', {
			acceptCharset: true
		}), '<meta accept-charset>')
	})

	it('should render httpEquiv to string', () => {
		assert.html(h('meta', {
			httpEquiv: true
		}), '<meta http-equiv>')
	})

	it('should render booleans to string', () => {
		assert.html(h('meta', {
			show: true,
			hidden: false
		}), '<meta show>')
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

	it('should render a fragment to json', () => {
		assert.json(
			h(class {
				render() {
					return [h('head'), h('body')]
				}
			}),
			`[{"type":"head","props":{},"children":[]},{"type":"body","props":{},"children":[]}]`
		)
	})

	it('should render a component to json', () => {
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

	it('should escape test', () => {
		assert.html(h('div', 'a<>"\'&b'), '<div>a&lt;&gt;&quot;&#x27;&amp;b</div>')
	})

	it('should render dangerouslySetInnerHTML to string', () => {
		assert.html(h('div', {
			dangerouslySetInnerHTML: {__html: '1'}
		}), '<div>1</div>')
	})

	it('should render innerHTML to string', () => {
		assert.html(h('div', {
			innerHTML: 'value'
		}), '<div>value</div>')
	})

	it('should not render dangerouslySetInnerHTML to string', () => {
		assert.html(h('div', {
			dangerouslySetInnerHTML: {}
		}), '<div></div>')

		assert.html(h('div', {
			dangerouslySetInnerHTML: undefined
		}), '<div></div>')
	})

	it('should render tabIndex to string', () => {
		assert.html(h('div', {tabIndex: 2}), '<div tabindex="2"></div>')
	})

	it('should update state from componentWillMount before rendering to string', () => {
		assert.html(h(class {
			getInitialState() {
				return {i: 0}
			}
			componentWillMount() {
				this.setState({i: this.state.i + 1})
			}
			componentDidMount() {
				throw 'SSR should not call componentDidMount'
			}
			componentWillUpdate() {
				throw 'SSR should not call componentWillUpdate'
			}
			componentDidUpdate() {
				throw 'SSR should not call componentDidUpdate'
			}
			shouldComponentUpdate() {
				throw 'SSR should not call shouldComponentUpdate'
			}
			componentWillRecieveProps() {
				throw 'SSR should not call componentWillRecieveProps'
			}
			render () {
				return this.state.i
			}
		}), '1')
	})

	it('should catch errors', () => {
		let error = null
		assert.html(h(class {
			componentDidCatch(err) {
				error = err
			}
			render () {
				throw new Error('Error!')
			}
		}), '')

		assert.instanceOf(error, Error)
	})

	it('should propagate errors', (done) => {
		let A = () => { throw new Error('x') }
		let error = null

		assert.html(h(class {
			componentDidCatch(err) {
				error = err
			}
			render () {
				return h('div', A)
			}
		}), '<div></div>')

		nextTick(() => {
			assert.instanceOf(error, Error)
			done()
		})
	})

	it('should pipe(renderToString) element to a stream', (done) => {
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

	it('should pipe(toStream) element to stream', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})
		let renderer = h('div', 1, 2, 3).toStream('utf8')
		let output = ''

		renderer.on('end', () => {
			assert.html(output, `<div>123</div>`)
			done()
		})

		renderer.pipe(writable)
	})

	it('should pipe(renderToNodeStream) element to stream', (done) => {
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

	it('should pipe(renderToNodeStream) component to stream', (done) => {
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

	it('should pipe(renderToNodeStream) element to stream', (done) => {
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

	it('should pipe(renderToNodeStream) element with dangerouslySetInnerHTML to stream', (done) => {
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

	it('should pipe(renderToNodeStream) and set header on a response stream', (done) => {
		let stack = []
		let Writable = new require('stream').Writable
		let writable = Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})

		writable.setHeader = (type, value) => stack.push(type, value)

		let element = h('div', {dangerouslySetInnerHTML: {__html: '1'}})
		let output = ''

		renderToNodeStream(element, writable, () => {
			assert.html(output, `<div>1</div>`)
			assert.lengthOf(stack, 2)
			assert.include(stack, 'text/html')
			assert.include(stack, 'Content-Type')
			done()
		})
	})

	it('should pipe(renderToNodeStream) an async element stream to stream', (done) => {
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

	it('should pipe(renderToNodeStream) an async component stream to a stream', (done) => {
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

	it('should pipe(renderToNodeStream) an async component with default getInitialState', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})
		let state = null

		let element = h(class {
			getInitialState() {
				return Promise.resolve(null)
			}
			render(props, {x}) {
				state = this.state
				return h('h1', 'Hello World', x)
			}
		})
		let output = ''

		renderToNodeStream(element, writable, () => {
			assert.html(output, '<h1>Hello World</h1>')
			assert.instanceOf(state, Object)
			done()
		})
	})

	it('should pipe(renderToNodeStream) an async component with async getInitialState', (done) => {
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

	it('should recover from an async getInitialState error', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})

		let element = h(class {
			componentDidCatch(err) {
				return {x: ' Error!'}
			}
			getInitialState() {
				return Promise.reject({x: '!'})
			}
			render(props, {x}) {
				return h('h1', 'Hello World', x)
			}
		})

		let output = ''

		renderToNodeStream(element, writable, () => {
			assert.html(output, '<h1>Hello World Error!</h1>')
			done()
		})
	})

	it('should not recover from async getInitialState error', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})
		let stack = []

		let element = h(class {
			getInitialState() {
				return Promise.reject({x: '!'})
			}
			render(props, {x}) {
				return h('h1', 'Hello World', x)
			}
		})

		let output = ''
		let defaultConsoleError = console.error

		console.error = () => stack.push(true)

		renderToNodeStream(element, writable, () => {
			assert.html(output, '')
			assert.deepEqual(stack, [true])
			console.error = defaultConsoleError
			done()
		})
	})

	it('should pipe(renderToNodeStream) an async generator component', () => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})
		let stack = []
		let element = h(class {
		  async *render() {
		  	stack.push('')

		  	var first = yield 'Hello'

		  	stack.push(first)

		  	var second = yield 'Hello World'

		  	stack.push(second)
		  }
		})

		let output = ''

		renderToNodeStream(element, writable, () => {
			assert.html(output, 'Hello World')
			assert.deepEqual(stack, ['', 'Hello'])
			done()
		})
	})
})
