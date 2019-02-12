import {h, render} from '../index.js'
import {useRef, useMemo, useCallback, useState, useReducer, useContext, useEffect, useLayout, useBoundary} from '../index.js'

// TODO useContext, useBoundary
describe('Hook', () => {
	describe('useRef', () => {
		it('should use a ref hook', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const ref = useRef(0)

				return ref.current
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '0')
			})
		})

		it('should use a ref hooks function initializer', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const ref = useRef(props => 0)

				return ref.current
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '0')
			})
		})

		it('should use a ref hooks function initializer with props', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const ref = useRef(props => props.children)

				return ref.current
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '0')
			})
		})

		it('should use multiple ref hooks', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const ref = useRef(1)
				const value = useRef(2)

				return ref.current + value.current
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '3')
			})
		})

		it('should preserve ref hooks', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const ref = useRef(0)

				stack.push(ref)

				return ref.current
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '0')

				render(h(Primary, {}, 0), target, (current) => {
					assert.html(current, '0')
					assert.equal(stack[0], stack[1])
				})
			})
		})
	})

	describe('useMemo', () => {
		it('should use a memo hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const value = useMemo(() => stack.push(1), [])

				return value
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '1')
				assert.deepEqual(stack, [1])

				render(h(Primary), target, (current) => {
					assert.html(current, '1')
					assert.deepEqual(stack, [1])
				})
			})
		})

		it('should use and update a memo hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const value = useMemo(([value]) => stack.push(value), [props.value])

				return value
			}

			render(h(Primary, {value: 1}), target, (current) => {
				assert.html(current, '1')
				assert.deepEqual(stack, [1])

				render(h(Primary, {value: 2}), target, (current) => {
					assert.html(current, '2')
					assert.deepEqual(stack, [1, 2])
				})
			})
		})
	})

	describe('useCallback', () => {
		it('should use a callback hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const value = useCallback((...args) => args)

				stack.push(value)

				return
			}

			render(h(Primary), target, (current) => {
				render(h(Primary), target, (current) => {
					assert.equal(stack[0], stack[1])
					assert.deepEqual(stack[0](1, 2), stack[1](1, 2))
				})
			})
		})
	})

	describe('useState', () => {
		it('should use a state hook', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const [state, setState] = useState(0)

				return state
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '0')
			})
		})

		it('should use a state hooks function initializer', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const [state, setState] = useState(props => 0)

				return state
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '0')
			})
		})

		it('should use a state hooks function initializer with props', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const [state, setState] = useState(props => props.children)

				return state
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '0')
			})
		})

		it('should use multiple state hooks', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const [state1, setState1] = useState(1)
				const [state2, setState2] = useState(2)

				return state1 + state2
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '3')
			})
		})

		it('should update a state hook within render', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state, setState] = useState(0)

				stack.push(state)

				if (state === props.children) {
					setState(1)
					setState(2)
				}

				return state
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '2')
				assert.deepEqual(stack, [0, 2])
			})
		})

		it('should use previous state to update a state hook within render', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state, setState] = useState(0)

				stack.push(state)

				if (state === props.children) {
					setState(state => state + 1)
					setState(state => state + 1)
				}

				return state
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '2')
				assert.deepEqual(stack, [0, 2])
			})
		})

		it('should not update a SameValue state hook within render', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state, setState] = useState(0)

				stack.push(state)

				if (state === props.children) {
					setState(0)
					setState(0)
				}

				return state
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '0')
				assert.deepEqual(stack, [0])
			})
		})

		it('should update multiple state hooks within events', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state1, setState1] = useState(0)
				const [state2, setState2] = useState(1)

				stack.push(state1, state2)

				return h('button', {onClick: [e => e.type, setState2, e => setState1(state => state + e)]}, state1, state2)
			}

			render(h(Primary, {}), target, (current) => {
				assert.html(current, '<button>01</button>')
				assert.deepEqual(stack, [0, 1])
				current.firstChild.dispatchEvent(new Event('click'))
				assert.deepEqual(stack, [0, 1, '0click', 'click'])
			})
		})
	})

	describe('useReducer', () => {
		it('should use a reducer hook', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const [state, dispatch] = useReducer((state, action) => action, 0)

				return state
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '0')
			})
		})

		it('should use a reducer hooks function initializer', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const [state, dispatch] = useReducer((state, action) => action, props => 0)

				return state
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '0')
			})
		})

		it('should use a reducer hooks function initializer with props', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const [state, dispatch] = useReducer((state, action) => action, props => props.children)

				return state
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '0')
			})
		})

		it('should use multiple reducer hooks', () => {
			const target = document.createElement('div')
			const Primary = props => {
				const [state1, dispatch1] = useReducer((state, action) => action, 1)
				const [state2, dispatch2] = useReducer((state, action) => action, 2)

				return state1 + state2
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '3')
			})
		})

		it('should update a reducer hook within render', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state, dispatch] = useReducer((state, action) => action, 0)

				stack.push(state)

				if (state === props.children) {
					dispatch(1)
					dispatch(2)
				}

				return state
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '2')
				assert.deepEqual(stack, [0, 2])
			})
		})

		it('should use previous reducer state to update a reducer hook within render', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state, dispatch] = useReducer((state, action) => action, 0)

				stack.push(state)

				if (state === props.children) {
					dispatch(state => state + 1)
					dispatch(state => state + 1)
				}

				return state
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '2')
				assert.deepEqual(stack, [0, 2])
			})
		})

		it('should not update a SameValue state hook within render', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state, dispatch] = useReducer((state, action) => action, 0)

				stack.push(state)

				if (state === props.children) {
					dispatch(0)
					dispatch(0)
				}

				return state
			}

			render(h(Primary, {}, 0), target, (current) => {
				assert.html(current, '0')
				assert.deepEqual(stack, [0])
			})
		})

		it('should update multiple state hooks within events', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state, dispatch1] = useReducer((state, action) => action, 0)
				const [value, dispatch2] = useReducer((state, action) => action, 1)

				stack.push(state, value)

				return h('button', {onClick: [e => e.type, dispatch2, e => dispatch1(state => state + e)]}, state, value)
			}

			render(h(Primary, {}), target, (current) => {
				assert.html(current, '<button>01</button>')
				assert.deepEqual(stack, [0, 1])
				current.firstChild.dispatchEvent(new Event('click'))
				assert.deepEqual(stack, [0, 1, '0click', 'click'])
			})
		})
	})

	describe('useLayout', () => {
		it('should use layout hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useLayout(() => {
					stack.push('useLayout')
				})
			}

			render(h(Primary), target, (current) => {
				assert.deepEqual(stack, ['useLayout'])
			})
		})

		it('should default to always update layout hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useLayout(() => {
					stack.push('useLayout')
				})
			}

			render(h(Primary), target, (current) => {
				assert.deepEqual(stack, ['useLayout'])

				render(h(Primary), target, (current) => {
					assert.deepEqual(stack, ['useLayout', 'useLayout'])
				})
			})
		})

		it('should update layout hook when values change', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useLayout(([value]) => {
					stack.push('useLayout', value)
				}, [props.value])
			}

			render(h(Primary), target, (current) => {
				assert.deepEqual(stack, ['useLayout', undefined])

				render(h(Primary), target, (current) => {
					assert.deepEqual(stack, ['useLayout', undefined])

					render(h(Primary, {value: 1}), target, (current) => {
						assert.deepEqual(stack, ['useLayout', undefined, 'useLayout', 1])
					})
				})
			})
		})

		it('should unmount layout hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useLayout(([value]) => {
					stack.push('useLayout', value, 'mount')
					return ([value]) => {
						stack.push('useLayout', value, 'unmount')
					}
				}, [props.value])
			}

			render(h(Primary, {value: 0}), target, (current) => {
				assert.deepEqual(stack, ['useLayout', 0, 'mount'])

				render(h(Primary, {value: 1}), target, (current) => {
					assert.deepEqual(stack, ['useLayout', 0, 'mount', 'useLayout', 0, 'unmount', 'useLayout', 1, 'mount'])

					render(null, target, (current) => {
						assert.deepEqual(stack, ['useLayout', 0, 'mount', 'useLayout', 0, 'unmount', 'useLayout', 1, 'mount', 'useLayout', 1, 'unmount'])
					})
				})
			})
		})
	})

	describe('useEffect', () => {
		it('should use effect hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useEffect(() => {
					stack.push('useEffect')
				})
			}

			render(h(Primary), target, (current) => {
				assert.deepEqual(stack, ['useEffect'])
			})
		})

		it('should default to always update effect hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useEffect(() => {
					stack.push('useEffect')
				})
			}

			render(h(Primary), target, (current) => {
				assert.deepEqual(stack, ['useEffect'])

				render(h(Primary), target, (current) => {
					assert.deepEqual(stack, ['useEffect', 'useEffect'])
				})
			})
		})

		it('should update effect hook when values change', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useEffect(([value]) => {
					stack.push('useEffect', value)
				}, [props.value])
			}

			render(h(Primary), target, (current) => {
				assert.deepEqual(stack, ['useEffect', undefined])

				render(h(Primary), target, (current) => {
					assert.deepEqual(stack, ['useEffect', undefined])

					render(h(Primary, {value: 1}), target, (current) => {
						assert.deepEqual(stack, ['useEffect', undefined, 'useEffect', 1])
					})
				})
			})
		})

		it('should unmount effect hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useEffect(([value]) => {
					stack.push('useEffect', value, 'mount')
					return ([value]) => {
						stack.push('useEffect', value, 'unmount')
					}
				}, [props.value])
			}

			render(h(Primary, {value: 0}), target, (current) => {
				assert.deepEqual(stack, ['useEffect', 0, 'mount'])

				render(h(Primary, {value: 1}), target, (current) => {
					assert.deepEqual(stack, ['useEffect', 0, 'mount', 'useEffect', 0, 'unmount', 'useEffect', 1, 'mount'])

					render(null, target, (current) => {
						assert.deepEqual(stack, ['useEffect', 0, 'mount', 'useEffect', 0, 'unmount', 'useEffect', 1, 'mount', 'useEffect', 1, 'unmount'])
					})
				})
			})
		})
	})
})
