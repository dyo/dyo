test('Hydrate', ({assert, done}) => {
	var container = document.createElement('div')

	class Foo {
		componentDidMount() {
			assert(findDOMNode(this).nodeType, 'hydrate DOM')
			assert(true, 'hydrate component')
		}
		render() {
			return h('section', {class: 'class'}, h('div', 'context'))
		}
	}

	hydrate(Foo, container)
	assert(compare(container, '<section class="class"><div>context</div></section>'), 'hydrate mount')

	container = document.createElement('div')
	container.innerHTML = '<section><div>incorrect</div><h1>extra</h1></section>'
	
	hydrate(h('section', {class: 'class'}, h('div', 'context')), container)
	assert(compare(container, '<section class="class"><div>context</div></section>'), 'hydrate reconcile')

	container = document.createElement('html')
	container.innerHTML = '<head></head><body></body>'
	hydrate([h('head', h('title', 'xxx')), ''], container)
	assert(compare(container, '<head><title>xxx</title></head>'), 'hydrate fragment')
	assert(container.childNodes.length === 4, 'hydrate empty string')

	done()
})
