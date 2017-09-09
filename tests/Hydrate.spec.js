test('Hydrate', ({assert, done}) => {
	var container = document.createElement('div')

	class Foo {
		componentDidMount() {
			assert(findDOMNode(this).nodeType, 'hydrate DOM')
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
	done()
})
