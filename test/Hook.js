import {h, memo, render, Suspense, Context} from '../index.js'
import {useRef, useMemo, useCallback, useState, useReducer, useContext, useResource, useEffect, useLayout} from '../index.js'

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

		it('should not update a memo hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const value = useMemo(() => stack.push(1))

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

		it('should update a callback hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				const value = useCallback((...args) => args, [stack.length])

				stack.push(value)

				return
			}

			render(h(Primary), target, (current) => {
				render(h(Primary), target, (current) => {
					assert.notEqual(stack[0], stack[1])
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
				useLayout(async e => {
					await new Promise((resolve) => setTimeout(resolve, 20))
					setState(v => v + 1)
					setState(v => v + 1)
				}, [])
				return state
			}

			render(h(Primary), target, (current) => {
				assert.html(current, '3')
				done(assert.deepEqual(stack, [1, 3]))
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

		it('should unmount layout hook', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useLayout(([value]) => {
					stack.push('useLayout', value, 'mount')
					return () => {
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

		it('should async unmount from layout hook', () => {
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

		it('should not async unmount from layout hook', (done) => {
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

		it('should throw in async unmount layout hook', (done) => {
			const target = document.createElement('div')
			const Primary = props => {
				useLayout(() => () => new Promise((resolve, reject) => setTimeout(reject, 0, 'x')))

				return 'preserve'
			}

			render(h(Primary), target, (current) => {
				render(null, current)
				assert.html(current, 'preserve')
			}).then(null, (current) => {
				assert.html(target, 'preserve')
				done(assert.equal(current, 'x'))
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

		it('should unmount effect hook', (done) => {
			const target = document.createElement('div')
			const stack = []
			const Primary = props => {
				useEffect(([value]) => {
					stack.push('useEffect', value, 'mount')
					return () => {
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

		it('should async unmount from effect hook', (done) => {
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
	})

	describe('useContext', () => {
		it('should provide and consume context', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = memo(({children}) => {
				const state = useState('red')
				const [theme, setTheme] = state

				stack.push('Primary', theme)

				return h(Context, {value: state}, h('button', {
					onClick: [e => setTheme(theme + '!'), e => setTheme(theme => theme + '!')]
				}, theme, children))
			}, () => true)

			const Secondary = memo(() => {
				const [theme, setTheme] = useContext(Primary)

				stack.push('Secondary', theme)

				return h('h1', {}, theme)
			}, () => true)

			const Indirection = memo(({children}) => {
				return children
			}, () => true)

			render(h(Primary, {}, h(Indirection, {}, h(Indirection, {}, Secondary))), target, (current) => {
				assert.deepEqual(stack, ['Primary', 'red', 'Secondary', 'red'])
				assert.html(current, '<button>red<h1>red</h1></button>')

				current.firstChild.dispatchEvent(new Event('click'))
				assert.deepEqual(stack, ['Primary', 'red', 'Secondary', 'red', 'Primary', 'red!!', 'Secondary', 'red!!'])
				assert.html(current, '<button>red!!<h1>red!!</h1></button>')
			})
		})

		it('should update context within render', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = memo(({children}) => {
				const state = useState('red')
				const [theme, setTheme] = state

				stack.push('Primary', theme)

				return h(Context, {value: state}, h('button', {}, theme, children))
			}, () => true)

			const Secondary = memo(() => {
				const [theme1, setTheme1] = useContext(Primary)
				const [theme2, setTheme2] = useContext(Primary)

				stack.push('Secondary', theme1, theme2)

				setTheme1('red!')
				setTheme2(theme => theme + '!')

				return h('h1', {}, theme1, theme2)
			}, () => true)

			const Indirection = memo(({children}) => {
				return children
			}, () => true)

			render(h(Primary, {}, h(Indirection, {}, h('div', {}, h(Indirection, {}, Secondary)))), target, (current) => {
				assert.deepEqual(stack, ['Primary', 'red', 'Secondary', 'red', 'red', 'Primary', 'red!!', 'Secondary', 'red!!', 'red!!'])
				assert.html(current, '<button>red!!<div><h1>red!!red!!</h1></div></button>')
			})
		})

		it('should not update context', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = memo(({children}) => {
				const state = useState('red')
				const [theme, setTheme] = state

				stack.push('Primary', theme)

				useLayout(() => {
					setTheme('red!')
				}, [])

				return h(Context, {value: 'red'}, h('button', {}, theme, children))
			}, () => true)

			const Secondary = memo(() => {
				const theme = useContext(Primary)

				stack.push('Secondary', theme)

				return h('h1', {}, theme)
			}, () => true)

			const Indirection = memo(({children}) => {
				return children
			}, () => true)

			render(h(Primary, {}, h(Indirection, {}, h(Indirection, {}, Secondary))), target, (current) => {
				assert.deepEqual(stack, ['Primary', 'red', 'Secondary', 'red', 'Primary', 'red!'])
				assert.html(current, '<button>red!<h1>red</h1></button>')
			})
		})

		it('should provide and consume more than one context', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = memo(({children}) => {
				const state = useState(props => 'red')
				const [theme, setTheme] = state

				stack.push('Primary', theme)

				return h(Context, {value: state}, children)
			}, () => true)

			const Secondary = memo(({children}) => {
				const state = useState(props => 'blue')
				const [theme, setTheme] = state

				stack.push('Secondary', theme)

				return h(Context, {value: state}, children)
			}, () => true)

			const Indirection = memo(({children}) => {
				return children
			}, () => true)

			render(h(Primary, {}, h(Indirection, {}, h(Indirection, {}, h(Secondary, {}, props => {
				const [theme1, setTheme1] = useContext(Primary)
				const [theme2, setTheme2] = useContext(Secondary)

				stack.push('Consumer', theme1, theme2)

				return [h('h1', {}, theme1), h('h1', {}, theme2)]
			})))), target, (current) => {
				assert.deepEqual(stack, ['Primary', 'red', 'Secondary', 'blue', 'Consumer', 'red', 'blue'])
				assert.html(current, '<h1>red</h1><h1>blue</h1>')
			})
		})

		it('should not consume invalid context provider', () => {
			const target = document.createElement('div')
			const stack = assert.spyr(console, 'error')
			const Primary = (({children}) => {
				stack.push('Primary')

				return h('button', {}, children)
			})

			const Secondary = (() => {
				const theme = useContext(Primary) || 'default'

				stack.push('Secondary', theme)

				return h('h1', {}, theme)
			})

			const Indirection = (({children}) => {
				return children
			})

			assert.throws(() => {
				render(h(Primary, {}, h(Indirection, {}, h(Indirection, {}, Secondary))), target)
			})

			assert.html(target, '')
		})

		it('should provide multiple context', () => {
			const target = document.createElement('div')
			const stack = []
			const Primary = memo(({children}) => {
				const state = useState('red')
				const [theme, setTheme] = state

				stack.push('Primary', theme)

				return h(Context, {value: state}, h('button', {}, theme, children))
			}, () => true)

			const Secondary = memo(() => {
				const [theme, setTheme] = useContext(Primary)

				stack.push('Secondary', theme)

				return h('h1', {}, theme)
			}, () => true)

			const Indirection = memo(({children}) => {
				return children
			}, () => true)

			render(h(Primary, {}, h(Indirection, {}, h(Indirection, {}, h(Primary, {}, Secondary)))), target, (current) => {
				assert.deepEqual(stack, ['Primary', 'red', 'Primary', 'red', 'Secondary', 'red'])
				assert.html(current, '<button>red<button>red<h1>red</h1></button></button>')
			})
		})

		it('should async update context', () => {
			const target = document.createElement('div')
			const stack = []
			const Indirection = memo(props => {
				return props.children
			}, () => true)
			const Provider = props => {
				return h(Context, {value: props.value}, props.children)
			}
			const Consumer = props => {
				return useContext(Provider)
			}

			const Primary = props => {
				const [state, dispatch] = useState(0)

				useEffect(async () => {
					await new Promise(resolve => setTimeout(resolve, 0))
					dispatch(state => state + 1)
				}, [])

				return h(Provider, {value: state}, h(Secondary, {value: 1}))
			}

			const Secondary = memo(props => {
				return h('div', {}, stack.push(props), h(Indirection, {}, h(Consumer)))
			}, () => true)

			render(h(Primary), target, (current) => {
				assert.html(current, '<div>11</div>')
				assert.deepEqual(stack, [{value: 1}])
			})
		})
	})

	describe('useResource', () => {
		it('should provide and consume resource', (done) => {
			const target = document.createElement('div')

			const Provider = memo(({children}) => {
				return h(Context, {
					value: useResource(() => Promise.resolve('Hello'))
				}, h('div', {}, children))
			}, () => true)

			const Consumer = memo(({children}) => {
				const resource = useContext(Provider)
				return h('button', {}, resource)
			}, () => true)

			const Indirection = memo(({children}) => {
				return children
			}, () => true)

			render(h(Suspense, {fallback: '...'}, h(Provider, {}, h(Indirection, {}, h(Consumer, {}, 'Hello World')))), target, (current) => {
				done(assert.html(current, '<div><button>Hello</button></div>'))
			})
		})

		it('should provide and consume json resource', (done) => {
			const target = document.createElement('div')

			const Provider = memo(({children}) => {
				return h(Context, {
					value: useResource(() => Promise.resolve({json() { return Promise.resolve('Hello') }}))
				}, h('div', {}, children))
			}, () => true)

			const Consumer = memo(({children}) => {
				const resource = useContext(Provider)
				return h('button', {}, resource)
			}, () => true)

			const Indirection = memo(({children}) => {
				return children
			}, () => true)

			render(h(Suspense, {fallback: '...'}, h(Provider, {}, h(Indirection, {}, h(Consumer, {}, 'Hello World')))), target, (current) => {
				done(assert.html(current, '<div><button>Hello</button></div>'))
			})
		})

		it('should provide and consume updated resource', (done) => {
			const target = document.createElement('div')

			const Provider = memo(({children, value}) => {
				return h(Context, {
					value: useResource(([value]) => Promise.resolve(value), [value])
				}, h('div', {}, children))
			}, () => false)

			const Consumer = memo(({children}) => {
				const resource = useContext(Provider)
				return h('button', {}, resource)
			}, () => true)

			const Indirection = memo(({children}) => {
				return children
			}, () => true)

			render(h(Suspense, {fallback: '...'}, h(Provider, {value: 'Hello'}, h(Indirection, {}, h(Consumer, {}, 'Hello World')))), target, (current) => {
				assert.html(current, '<div><button>Hello</button></div>')

				render(h(Suspense, {fallback: '...'}, h(Provider, {value: 'World'}, h(Indirection, {}, h(Consumer, {}, 'Hello World')))), target, (current) => {
					done(assert.html(current, '<div><button>World</button></div>'))
				})
			})
		})
	})
})
