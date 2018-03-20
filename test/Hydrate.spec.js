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

		assert.equal(container.childNodes.length, 3)
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

	it('should not repair correct properties', () => {
		let container = document.createElement('div')
		container.innerHTML = `<div id="1"><span></span></div>`

		hydrate(h('div', {id: 1}, [undefined, h('span')]), container)
		assert.html(container, '<div id="1"><span></span></div>')
	})

	it('should not repair correct camleCase attributes', () => {
		let container = document.createElement('div')
		container.innerHTML = `<video autoplay=""><video>`

		hydrate(h('video', {autoPlay: true}), container)
		assert.html(container, '<video autoplay=""></video>')
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

	it('should hydrate from the implicit root container', () => {
		let container = document.createElement('html')
		let documentElement = document.documentElement
		let children = [h('head', h('title', 'title')), h('body', h('div'))]

		container.innerHTML = '<head><title>title</title></head><body><div></div></body>'

		Object.defineProperty(document, 'documentElement', {
		  enumerable: true,
		  configurable: true,
		  writable: true,
		  value: container
		})

		hydrate(children)
		assert.doesNotThrow(() => {
			findDOMNode(children[0])
			findDOMNode(children[1])
		})
		assert.html(container, '<head><title>title</title></head><body><div></div></body>')

		render([h('head', h('title', 'title')), h('body', h('div', 'text'))])
		assert.html(container, '<head><title>title</title></head><body><div>text</div></body>')

		Object.defineProperty(document, 'documentElement', {
		  enumerable: true,
		  configurable: true,
		  writable: true,
		  value: documentElement
		})
	})

	it('should hydrate an empty string element', () => {
		let container = document.createElement('div')
		container.innerHTML = '<span></span>'

		hydrate('', container)
		assert.html(container, '')
		assert.lengthOf(container.childNodes, 1)
		assert.equal(container.firstChild.nodeType, 3)
	})

	it('should distinguish adjacent text components', () => {
		let container = document.createElement('div')
		let A = () => 'a'
		let B = () => 'b'
		let C = () => 'c'

		container.innerHTML = h('div', A, B, C).toString()
		assert.html(container, '<div>abc</div>')

		hydrate(h('div', A, B, C), container)
		assert.html(container, '<div>abc</div>')

		assert.equal(container.firstChild.childNodes.length, 3)
		assert.equal(container.firstChild.firstChild.nodeValue, 'a')
		assert.equal(container.firstChild.firstChild.nextSibling.nodeValue, 'b')
		assert.equal(container.firstChild.lastChild.nodeValue, 'c')
	})

	it('should hydrate adjacent text nodes with differing lengths', () => {
		let container = document.createElement('div')
		var A = () => h('div', 'abcabcabc', 'xxx')

		container.innerHTML = '<div>buy now</div>'

		hydrate(A, container)
		assert.html(container, '<div>abcabcabcxxx</div>')

		assert.equal(container.firstChild.childNodes.length, 2)
		assert.equal(container.firstChild.firstChild.nodeValue, 'abcabcabc')
		assert.equal(container.firstChild.lastChild.nodeValue, 'xxx')
	})

	it('should hydrate comment elements', () => {
		let container = document.createElement('div')

		hydrate(createComment('1st'), container)

		assert.lengthOf(container.childNodes, 1)
		assert.html(container, `<!--1st-->`)

		container.innerHTML = '<!--2nd-->'
		hydrate(createComment('2nd'), container)

		assert.lengthOf(container.childNodes, 1)
		assert.html(container, `<!--2nd-->`)

		container.innerHTML = '<!--incorrect-->'
		hydrate(createComment('3rd'), container)

		assert.lengthOf(container.childNodes, 1)
		assert.html(container, `<!--3rd-->`)
	})
})
