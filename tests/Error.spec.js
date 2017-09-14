test('Error', ({assert, done}) => {
	var container = document.createElement('div')
	var stack = []

	class Foo {
		componentDidCatch(err) {
			err.report = false
			stack.push(err)
			return '!invalid'
		}
		render() {
			return h('!invalid')
		}
	}

	render(Foo, container)
	assert(stack.length && compare(container, '!invalid'), 'catch invalid render node')

	done()
})
