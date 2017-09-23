describe('Server', () => {
	it('should catch errors', () => {
		let error = null
		assert.html(h(class {
			componentDidCatch(err) {
				error = err
				err.report = false
			}
			render () {
				throw new Error('Error!')
			}
		}).toString(), '')

		assert.instanceOf(error, Error)
	})

	it('should bubble errors', () => {
		let A = () => { throw new Error('x') }
		let error = null

		assert.html(h(class {
			componentDidCatch(err) {
				error = err
				err.report = false
			}
			render () {
				return h('div', A)
			}
		}), '<div></div>')

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
		assert.html(h('area'), '<area>')
		assert.html(h('keygen'), '<keygen>')
		assert.html(h('img'), '<img>')
		assert.html(h('col'), '<col>')
		assert.html(h('embed'), '<embed>')
		assert.html(h('track'), '<track>')
		assert.html(h('track'), '<track>')
		assert.html(h('param'), '<param>')
		assert.html(h('link'), '<link>')
		assert.html(h('input'), '<input>')
		assert.html(h('hr'), '<hr>')
		assert.html(h('!doctype'), '<!doctype>')
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

	it('should render string to writable', (done) => {
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

	it('should render to a writable stream', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})

		let element = [h('h1', {className: 'foo'}, 1, 2, h('p', 'Hello'), h('span'), h('img'))]
		let output = ''

		renderToStream(element, writable, () => {
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

	it('should render an async element to a writable stream', (done) => {
		let writable = new require('stream').Writable({
		  write(chunk, encoding, callback) {
	      output += chunk.toString()
	      callback()
		  }
		})

		let element = Promise.resolve([h('h1', {className: 'foo'}, 1, 2, h('p', 'Hello'), h('span'), h('img'))])
		let output = ''

		renderToStream(element, writable, () => {
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
})
