describe.only('Assert', () => {
	before(() => (globalThis.process.env.NODE_ENV = 'development'))
  after(() => (globalThis.process.env.NODE_ENV = ''))

	it('should assert propTypes', async () => {
		const {h, render, Component} = await import('../index.js')

		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push.apply(stack, error) }
		}

		class Secondary extends Component {
			render({children}) { return h(Tertiary, children) }
		}

		class Tertiary extends Component {
			static propTypes() {
				return {
					children(props, name, display, type) {
						if (typeof props[name] !== 'number') {
							return [props, name, display, type]
						}
					}
				}
			}
		}

		render(h(Primary, h(Secondary, 'prop')), target, (current) => {
			assert.deepEqual(stack, [{children: 'prop'}, 'children', 'Tertiary', 'propTypes'])
		})
	})
return
	// it('should assert contextTypes', async () => {
	// 	const {h, render, Component} = await import('../index.js?')

	// 	const target = document.createElement('div')
	// 	const stack = []

	// 	class Primary extends Component {
	// 		componentDidCatch(error) { stack.push.apply(stack, error) }
	// 	}

	// 	class Secondary extends Component {
	// 		getChildContext(props) { return props }
	// 		render({children}) { return h(Tertiary, children) }
	// 	}

	// 	class Tertiary extends Component {
	// 		static contextTypes() {
	// 			return {
	// 				children(props, name, display, type) {
	// 					if (typeof props[name] !== 'number') {
	// 						return [props, name, display, type]
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}

	// 	render(h(Primary, h(Secondary, 'context')), target, (current) => {
	// 		assert.deepEqual(stack, [{children: 'context'}, 'children', 'Tertiary', 'contextTypes'])
	// 	})
	// })
})
