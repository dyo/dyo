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

	it('should repair invalid elements', () => {
		let container = document.createElement('div')
		container.innerHTML = '<section><div>incorrect</div><h1>extra</h1></section>'
		
		hydrate(h('section', {class: 'class'}, h('div', 'context')), container)
		assert.html(container, '<section class="class"><div>context</div></section>')
	})

	it('should remove invalid elements', () => {
		let container = document.createElement('div')
		container.innerHTML = '<div><div>xxx</div></div>'

		hydrate(() => h('div', [undefined, h('span')]), container)
		assert.html(container, '<div><span></span></div>')
	})

	it('should hydrate a fragment element', () => {
		let container = document.createElement('html')
		container.innerHTML = '<head></head><body></body>'

		hydrate([h('head', h('title', 'xxx')), ''], container)
		assert.html(container, '<head><title>xxx</title></head>')
	})

	it('should hydrate empty string element', () => {
		let container = document.createElement('html')
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
})
