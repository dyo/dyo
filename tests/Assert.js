import {h, render, Component} from 'dyo'

const env = process.env.NODE_ENV

describe('Assert', () => {
	it('should assert propTypes', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push.apply(stack, error) }
		}

		class Secondary extends Component {
			render(props) { return h(Tertiary, props) }
		}

		class Tertiary extends Component {
			static propTypes() {
				return {
					children(props, name, display, type) {
						if (typeof props[name] !== 'string') {
							return [props, name, display, type]
						}
					},
					name(props, name, display, type) {
						if (typeof props[name] !== 'number') {
							return [props, name, display, type]
						}
					}
				}
			}
		}

		render(h(Primary, h(Secondary, {children: 'prop', name: 'prop'})), target, (current) => {
			assert.deepEqual(stack, env === 'development' ? [{children: 'prop', name: 'prop'}, 'name', 'Tertiary', 'propTypes'] : [])
		})
	})

	it('should assert contextTypes', () => {
		const target = document.createElement('div')
		const stack = []

		class Primary extends Component {
			componentDidCatch(error) { stack.push.apply(stack, error) }
		}

		class Secondary extends Component {
			getChildContext(props) { return props }
			render(props) { return h(Tertiary, props) }
		}

		class Tertiary extends Component {
			static contextTypes() {
				return {
					children(props, name, display, type) {
						if (typeof props[name] !== 'string') {
							return [props, name, display, type]
						}
					},
					name(props, name, display, type) {
						if (typeof props[name] !== 'number') {
							return [props, name, display, type]
						}
					}
				}
			}
		}

		render(h(Primary, h(Secondary, {children: 'context', name: 'context'})), target, (current) => {
			assert.deepEqual(stack, env === 'development' ? [{children: 'context', name: 'context'}, 'name', 'Tertiary', 'contextTypes'] : [])
		})
	})
})
