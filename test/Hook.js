import {h, memo, render, createContext} from '../index.js'
import {useRef, useMemo, useCallback, useState, useReducer, useContext, useEffect, useLayout, useBoundary} from '../index.js'

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

		it('should update a ref hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const ref1 = useRef()
				const ref2 = useRef()

				useLayout(() => {
					stack.push(!!ref1.current, !!ref2.current)
				})

				return h('h1', {ref: props.i === 1 ? ref1 : ref2}, props.i)
			}

			render(h(Primary, {i: 1}), target, (current) => {
				assert.html(current, '<h1>1</h1>')
				assert.deepEqual(stack, [true, false])
			}).then((current) => {
				render(h(Primary,  {i: 2}), target, (current) => {
					assert.html(current, '<h1>2</h1>')
					assert.deepEqual(stack, [true, false, false, true])
				})
			}).then((current) => {
				render(null, target, (current) => {
					assert.html(current, '')
					assert.deepEqual(stack, [true, false, false, true])
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

		it('should use a callback hook with arguments', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const value = useCallback((...args) => args, [0])

				stack.push(value)

				return
			}

			render(h(Primary), target, (current) => {
				render(h(Primary), target, (current) => {
					assert.equal(stack[0], stack[1])
					assert.deepEqual(stack[0](1, 2), stack[1](1, 2))
					assert.deepEqual(stack[0](1, 2), [1, 2, [0]])
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

				return h('button', {onClick: [e => setState2(e.type), e => setState1(state => state + e.type)]}, state1, state2)
			}

			render(h(Primary, {}), target, (current) => {
				assert.html(current, '<button>01</button>')
				assert.deepEqual(stack, [0, 1])
				current.firstChild.dispatchEvent(new Event('click'))
				assert.deepEqual(stack, [0, 1, '0click', 'click'])
			})
		})

		it('should update a state hook out of band', (done) => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state, setState] = useState(1)
				stack.push(state)
				useLayout(e => setTimeout(() => setState(2)), [])
				return state
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '1')
			}).then((current) => {
				setTimeout(() => {
					assert.html(current, '2')
					done(assert.deepEqual(stack, [1, 2]))
				})
			})
		})

		it('should not update an unmounted component', (done) => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state, setState] = useState(1)
				stack.push(state)
				useLayout(e => setTimeout(() => setState(2)), [])
				return state
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '1')
				render(null, target)
			}).then((current) => {
				setTimeout(() => {
					done(assert.deepEqual(stack, [1]))
				})
			})
		})

		it('should collapse commited state hook updates', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state, setState] = useState(0)

				stack.push('Primary', state)

				return h(Secondary, {state, setState})
			}

			const Secondary = props => {
				const [state, setState] = useState(0)

				stack.push('Secondary', state)

				useLayout(() => {
					props.setState(1)
					setState(2)
				}, [])

				return state + props.state
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '3')
				assert.deepEqual(stack, ['Primary', 0, 'Secondary', 0, 'Primary', 1, 'Secondary', 2])
			})
		})

		it('should batch out of band state updates from event', (done) => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [{children}, dispatch] = useState(props)

				stack.push(children)

				return h('button', {
					onClick: [async event => {
						await new Promise((resolve) => setTimeout(resolve))
						dispatch({children: 'Hello'})
						dispatch({children: 'Hello World'})
					}]
				}, children)
			}

			render(h(Primary, {}, 'Click Me'), target, (current) => {
				assert.html(current, '<button>Click Me</button>')
				current.firstChild.dispatchEvent(new Event('click'))
			}).then((current) => {
				assert.html(current, '<button>Hello World</button>')
				render(null, target)
				assert.html(current, '')
				done(assert.deepEqual(stack, ['Click Me', 'Hello World']))
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

				return h('button', {onClick: [e => dispatch2(e.type), e => dispatch1(state => state + e.type)]}, state, value)
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

		it('should defer unmount from layout hook', () => {
			const target = document.createElement('div')
			const Primary = props => {
				useLayout(() => () => new Promise((resolve) => setTimeout(resolve)))
				useLayout(() => () => new Promise((resolve) => setTimeout(resolve)))

				return 'preserve'
			}

			render(h(Primary), target, (current) => {
				render(null, current)
				assert.html(current, 'preserve')
			}).then((current) => {
				assert.html(current, '')
			})
		})

		it('should not defer unmount from layout hook', (done) => {
			const target = document.createElement('div')
			const Primary = props => {
				useLayout(() => () => Promise.resolve())
				return props.children
			}

			render(h('div', {}, h(Primary, {}, 1)), target, (current) => {
				render(null, target)
				done(assert.html(target, ''))
			})
		})

		it('should not resolve unmounted components deferred unmount from layout hook', (done) => {
			const target = document.createElement('div')
			const Primary = props => {
				useLayout(() => () => Promise.resolve())
				return props.children
			}

			render(h('div', {}, h(Primary, {}, 1)), target, (current) => {
				render(h('div', {}, null), target)
				assert.html(target, '<div>1</div>')

				render(null, target)
				done(assert.html(target, ''))
			})
		})

		it('should batch out of band updates from layout hook', (done) => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [{children}, dispatch] = useState(props)

				stack.push(children)

				useLayout(async props => {
					await new Promise((resolve) => setTimeout(resolve))
					dispatch({children: 'Hello'})
					dispatch({children: 'Hello World'})
					return () => stack.push('unmount')
				}, [])

				return h('button', {}, children)
			}

			render(h(Primary, {}, 'Click Me'), target, (current) => {
				assert.html(current, '<button>Hello World</button>')
				render(null, target)
				assert.html(current, '')
				done(assert.deepEqual(stack, ['Click Me', 'Hello World', 'unmount']))
			})
		})
	})

	describe('useEffect', () => {
		it('should use effect hook', (done) => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useEffect(() => {
					stack.push('useEffect')
				})
			}

			render(h(Primary), target, (current) => {
				done(assert.deepEqual(stack, ['useEffect']))
			})
		})

		it('should default to always update effect hook', (done) => {
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
					done(assert.deepEqual(stack, ['useEffect', 'useEffect']))
				})
			})
		})

		it('should update effect hook when values change', (done) => {
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
						done(assert.deepEqual(stack, ['useEffect', undefined, 'useEffect', 1]))
					})
				})
			})
		})

		it('should unmount effect hook', (done) => {
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
						done(assert.deepEqual(stack, [
							'useEffect', 0, 'mount', 'useEffect', 0, 'unmount', 'useEffect', 1, 'mount', 'useEffect', 1, 'unmount'
						]))
					})
				})
			})
		})

		it('should defer unmount from effect hook', (done) => {
			const target = document.createElement('div')
			const Primary = props => {
				useEffect(() => () => new Promise((resolve) => setTimeout(resolve)))

				return 'preserve'
			}

			render(h(Primary), target, (current) => {
				render(null, current)
				assert.html(current, 'preserve')
			}).then((current) => {
				done(assert.html(current, ''))
			})
		})

		it('should not invoke effect hook of unmount component', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useEffect(() => {
					stack.push('useLayout')
				})
			}

			render(h(Primary), target, (current) => {
				assert.deepEqual(stack, [])
			})
			render(null, target)
		})

		it('should batch out of band updates from effect hook', (done) => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [{children}, dispatch] = useState(props)

				stack.push(children)

				useEffect(async props => {
					await new Promise((resolve) => setTimeout(resolve))
					dispatch({children: 'Hello'})
					dispatch({children: 'Hello World'})
					return () => stack.push('unmount')
				}, [])

				return h('button', {}, children)
			}

			render(h(Primary, {}, 'Click Me'), target, (current) => {
				assert.html(current, '<button>Hello World</button>')
				render(null, target)
				assert.html(current, '')
				done(assert.deepEqual(stack, ['Click Me', 'Hello World', 'unmount']))
			})
		})
	})

	describe('useBoundary', () => {
		it('should use boundary hooks', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const [state, dispatch] = useState(0)
				useBoundary(exception => stack.push(1))

				return props => { throw 0 }
			}

			assert.doesNotThrow(() => {
				render(h(Primary, {}), target, (current) => {
					assert.html(current, '')
					assert.deepEqual(stack, [1])
				})
			})
		})

		it('should use multiple boundary hooks', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useBoundary(exception => stack.push(1))
				useBoundary(exception => stack.push(2))

				return props => { throw 0 }
			}

			assert.doesNotThrow(() => {
				render(h(Primary, {}, 0), target, (current) => {
					assert.html(current, '')
					assert.deepEqual(stack, [1, 2])
				})
			})
		})

		it('should propagate exception in a boundary hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useBoundary(exception => stack.push(1))
				return props => {
					useBoundary(exception => stack.push(2))
					useBoundary(exception => { throw 3 })
					useBoundary(exception => stack.push(4))

					return props => { throw 0 }
				}
			}

			assert.doesNotThrow(() => {
				render(h(Primary, ), target, (current) => {
					assert.deepEqual(stack, [2, 1])
				})
			})
		})

		it('should provide an exception argument to boundary hooks', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useBoundary(exception => stack.push(exception))

				return props => { throw 0 }
			}

			assert.doesNotThrow(() => {
				render(h(Primary), target, (current) => {
					assert.deepEqual(stack, [{name: 'Exception', message: 0, bubbles: false}])
				})
			})
		})

		it('should use boundary hooks within an update', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useBoundary(exception => stack.push(exception))
				return props.children
			}
			const Secondary = props => {
				if (props.throw) {
					throw 'error!'
				}

				return 'Preserve'
			}

			render(h(Primary, {}, h(Secondary, {throw: false})), target)
			render(h(Primary, {}, h(Secondary, {throw: true})), target)

			assert.html(target, 'Preserve')
			assert.deepEqual(stack, [{name: 'Exception', message: 'error!', bubbles: false}])
		})

		it('should catch errors raised from promise elements', (done) => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useBoundary(exception => stack.push(exception))

				return props => h(Promise.reject(0))
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '')
			}).then((current) => {
				done(assert.deepEqual(stack, [{name: 'Exception', message: 0, bubbles: false}]))
			})
		})
	})

	describe('useContext', () => {
		it('should use and update global context', () => {
			const target = document.createElement('div')
			const stack = []
			const ThemeContext = createContext('white')
			const Primary = memo(({children}) => {
				const [theme, setTheme] = useContext(ThemeContext)

				stack.push(theme)

				return [h('button', {onClick: [e => setTheme(theme + '1'), e => setTheme(theme => theme + '2')]}, theme), children]
			})

			render([h(Primary, {}, props => h(Primary))], target, (current) => {
				assert.deepEqual(stack, ['white', 'white'])
				assert.html(current, '<button>white</button><button>white</button>')

				current.firstChild.dispatchEvent(new Event('click'))
				assert.deepEqual(stack, ['white', 'white', 'white12', 'white12'])
				assert.html(current, '<button>white12</button><button>white12</button>')
			})
		})

		it('should use and update local context', () => {
			const target = document.createElement('div')
			const stack = []
			const ThemeContext = createContext('white')
			const Primary = memo(({children}) => {
				const [theme, setTheme] = useContext(ThemeContext)

				stack.push(theme)

				return [h('button', {onClick: [e => setTheme(theme + '1'), e => setTheme(theme => theme + '2')]}, theme), children]
			})

			render(h(ThemeContext, {value: 'black'}, h(Primary, {}, props => h(Primary))), target, (current) => {
				assert.deepEqual(stack, ['black', 'black'])
				assert.html(current, '<button>black</button><button>black</button>')

				current.firstChild.dispatchEvent(new Event('click'))
				assert.deepEqual(stack, ['black', 'black', 'black12', 'black12'])
				assert.html(current, '<button>black12</button><button>black12</button>')
			})
		})

		it('should use but not update global context', () => {
			const target = document.createElement('div')
			const stack = []
			const ThemeContext = createContext('white')
			const Primary = memo(({children}) => {
				const [theme, setTheme] = useContext(ThemeContext)

				stack.push(theme)

				return [h('button', {onClick: [e => setTheme(theme => theme), e => setTheme(theme => theme)]}, theme), children]
			})

			render([h(Primary, {}, props => h(Primary))], target, (current) => {
				assert.deepEqual(stack, ['white', 'white'])
				assert.html(current, '<button>white</button><button>white</button>')

				current.firstChild.dispatchEvent(new Event('click'))
				assert.deepEqual(stack, ['white', 'white'])
				assert.html(current, '<button>white</button><button>white</button>')
			})
		})

		it('should use but not update local context', () => {
			const target = document.createElement('div')
			const stack = []
			const ThemeContext = createContext('white')
			const Primary = memo(({children}) => {
				const [theme, setTheme] = useContext(ThemeContext)

				stack.push(theme)

				return [h('button', {onClick: [e => setTheme(theme => theme), e => setTheme(theme => theme)]}, theme), children]
			})

			render(h(ThemeContext, {value: 'black'}, h(Primary, {}, props => h(Primary))), target, (current) => {
				assert.deepEqual(stack, ['black', 'black'])
				assert.html(current, '<button>black</button><button>black</button>')

				current.firstChild.dispatchEvent(new Event('click'))
				assert.deepEqual(stack, ['black', 'black'])
				assert.html(current, '<button>black</button><button>black</button>')
			})
		})

		it('should use and unmount context', () => {
			const target = document.createElement('div')
			const stack = []
			const ThemeContext = createContext('white')
			const Primary = ({children}) => {
				const [theme, setTheme] = useContext(ThemeContext)

				stack.push(theme)

				return [theme, children]
			}

			render(h(ThemeContext, {value: 'black'}, h(Primary, {}, props => h(Primary))), target, (current) => {
				assert.deepEqual(stack, ['black', 'black'])
				assert.html(current, 'blackblack')
			})

			render(null, target, (current) => {
				assert.html(current, '')
			})
		})

		it('should not update unmounted context consumer', (done) => {
			const target = document.createElement('div')
			const stack = []
			const ThemeContext = createContext('white')
			const Primary = props => {
				const [context, setContext] = useContext(ThemeContext)
				useEffect(() => setContext('black'))
				stack.push(context)
				return context
			}

			render([h(Primary, {key: 0}), h(Primary, {key: 1}), h(Primary, {key: 2})], target, (current) => {
				assert.html(current, 'blackblack')
				assert.deepEqual(stack, ['white', 'white', 'white', 'white', 'white', 'black', 'black'])
			}).then(() => done())

			render([h(Primary, {key: 0}), h(Primary, {key: 2})], target)
		})

		it('should granular update context consumer', () => {
			const target = document.createElement('div')
			const stack = []
			const ThemeContext = createContext('white')
			const Primary = props => {
				const [context, setContext] = useContext(ThemeContext)
				useLayout(() => setContext('black'))
				stack.push(context)
				return [context, props.n === 0 ? h(Primary, {n: 1}) : null]
			}

			render(h(Primary, {n: 0}), target, (current) => {
				assert.html(current, 'blackblack')
				assert.deepEqual(stack, ['white', 'white', 'black', 'black'])
			})
		})
	})
})
