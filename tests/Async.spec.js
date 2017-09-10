test('async componentWillUnmount', ({assert, done}) => {
	var container = document.createElement('div')
	var counter = 0

	class Foo {
		componentWillUnmount() {
			return new Promise((resolve) => {
				assert(compare(container, '<h1>Hello</h1>'), 'async componentWillUnmount#preserve')
				resolve()

				setTimeout(()=>{
					assert(compare(container, ''), 'async componentWillUnmount#unmount')
					done()
				})
			}).catch((r) => console.log(r))
		}
		render() {
			return h('h1', 'Hello')
		}
	}

	render(Foo, container)
	render(null, container)
})
