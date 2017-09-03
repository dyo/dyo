module.exports = ({render, findDOMNode, hydrate, h, isValidElement, cloneElement}) => {
	test('Hydrate', ({ok, end}) => {
		var container = document.createElement('div')

		class Foo {
			componentDidMount() {
				ok(findDOMNode(this).nodeType, 'hydrate DOM')
			}
			render() {
				return h('section', {class: 'class'}, h('div', 'context'))
			}
		}

		hydrate(Foo, container)
		ok(compare(container, '<section class="class"><div>context</div></section>'), 'hydrate mount')

		container = document.createElement('div')
		container.innerHTML = '<section><div>incorrect</div><h1>extra</h1></section>'
		
		hydrate(h('section', {class: 'class'}, h('div', 'context')), container)
		ok(compare(container, '<section class="class"><div>context</div></section>'), 'hydrate reconcile')

		end()
	})
}
