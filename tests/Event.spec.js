module.exports = ({render, h, isValidElement, cloneElement}) => {
	test('Event', ({ok, end}) => {
		var container = document.createElement('div')
		var click = new Event('click')
		var mousedown = new Event('mousedown')

		class Foo {
			handleEvent(e) {
				if (e.type === 'click')
					ok(true, 'event(EventListener)')

				if (e.type === 'mousedown') {
					ok(this instanceof Foo, 'event(function)')
					ok(true, 'multiple events')
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
		
		end()
	})
}
