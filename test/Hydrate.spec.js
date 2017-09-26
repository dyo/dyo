describe('Hydrate', () => {
	it('should mount to an empty element', () => {
		let container = document.createElement('div')
		let refs = null

		hydrate(class {
			componentDidMount() {
				refs = this
			}
			render() {
				return h('section', {class: 'class'}, h('div', 'context'))
			}
		}, container)

		assert.property(findDOMNode(refs), 'nodeType')
		assert.html(container, '<section class="class"><div>context</div></section>')
	})

	it('should hydrate sibling text elements', () => {
		let container = document.createElement('div')
		let element = h('div', '1', '2')
		let children = element.children

		container.innerHTML = '<div>12</div>'

		hydrate(element, container)
		assert.equal(container.firstChild.childNodes.length, 2)
		assert.doesNotThrow(() => {
			findDOMNode(children.next)
			findDOMNode(children.prev)
		})
	})

	it('should hydrate a fragment element', () => {
		let container = document.createElement('div')
		container.innerHTML = '<head></head><body></body>'

		hydrate([h('head', h('title', 'xxx')), ''], container)
		assert.html(container, '<head><title>xxx</title></head>')
	})

	it('should hydrate empty string element', () => {
		let container = document.createElement('div')
		hydrate('', container)
		assert.lengthOf(container.childNodes, 1)
	})

	it('should hydrate multiple fragment components', () => {
		let container = document.createElement('div')
		container.innerHTML = '<span>invalid</span>'

		let A = () => h('span', 'aaa')
		let B = () => h('span', 'bbb')
		let C = () => [A]
		let D = () => [B]
		
		let first = container.querySelector('span')
		hydrate(C, container)

		let second = container.querySelector('span')
		hydrate(D, container)

		assert.lengthOf(container.childNodes, 3)
		assert.html(container, '<span>bbb</span>')
		assert.html(first, 'bbb')
		assert.html(second, 'bbb')
	})

	it('should repair incorrect text', () => {
		let container = document.createElement('div')
		container.innerHTML = '<section><div>incorrect</div></section>'
		
		hydrate(h('section', {class: 'class'}, h('div', 'correct')), container)
		assert.html(container, '<section class="class"><div>correct</div></section>')
	})

	it('should remove incorrect content', () => {
		let container = document.body.appendChild(document.createElement('div'))
		container.innerHTML = `<div id=1 style="color:red"><div>xxx</div></div>`

		hydrate(h('div', h('div')), container)
		assert.html(container, '<div><div></div></div>')
	})

	it('should repair incorrect properties', () => {
		let container = document.createElement('div')
		container.innerHTML = `<div data-id=true style="color:red"><span></span></div>`

		hydrate(h('div', {id: 1}, [undefined, h('span')]), container)
		assert.html(container, '<div id="1"><span></span></div>')
	})

	it('should remove incorrect in-between elements', () => {
		let container = document.createElement('div')
		container.innerHTML = '<div><div>xxx</div></div>'

		hydrate(() => h('div', [undefined, h('span')]), container)
		assert.html(container, '<div><span></span></div>')
	})

	it('should remove incorrect tail elements', () => {
		let container = document.createElement('div')
		container.innerHTML = '<section><div>correct</div><h1>extra</h1></section>'
		
		hydrate(h('section', {class: 'class'}, h('div', 'correct')), container)
		assert.html(container, '<section class="class"><div>correct</div></section>')
	})

	it('should remove incorrect tail elements after text', () => {
		let container = document.createElement('div')
		container.innerHTML = '<div>abc<a>XXX</a></div>'

		hydrate(h('div', 'abc'), container)
		assert.html(container, '<div>abc</div>')
	})

	it('should hydrate portals', () => {
		let html = document.createElement('div')
		let head = html.appendChild(document.createElement('head'))
		let container = html.appendChild(document.createElement('div'))
		container.innerHTML = `<div><h1>Before</h1><title>Portal</title><h1>After</h1></div>`
		
		let portal = createPortal(h('title', 'Title', h('meta', 'Portal')), head)
		let element = h('div', h('h1', 'Before'), portal, h('h1', 'After'))

		hydrate(element, container)
		assert.html(container, `
			<div>
				<h1>Before</h1>
				<h1>After</h1>
			</div>
		`)
		assert.html(head, '<title>Title<meta></title>')
	})

	it('should repair elements after portals ', () => {
		let html = document.createElement('div')
		let head = html.appendChild(document.createElement('head'))
		let container = html.appendChild(document.createElement('div'))
		container.innerHTML = `<div><h1>Before</h1><title>Portal</title><h1>After</h1></div>`
		
		let portal = createPortal(h('title', 'Title', h('meta', 'Portal')), head)
		let element = h('div', h('h1', 'Before'), portal)

		hydrate(element, container)
		assert.html(container, `
			<div>
				<h1>Before</h1>
			</div>
		`)
		assert.html(head, `<title>Title<meta></title>`)
	})
})
