test('Event', ({assert, done}) => {
	var container = document.createElement('div')
	var click = new Event('click')
	var mousedown = new Event('mousedown')

	class Foo {
		handleEvent(e) {
			if (e.type === 'click')
				assert(true, 'event(EventListener)')

			if (e.type === 'mousedown') {
				assert(this instanceof Foo, 'event(function)')
				assert(true, 'multiple events')
			}
		}
		componentDidMount(node) {
			node.dispatchEvent(click)
			node.dispatchEvent(mousedown)
		}
		render() {
			return h('button', {onClick: this, onMouseDown: this.handleEvent})
		}
	}

	render(Foo, container)
	done()
})
