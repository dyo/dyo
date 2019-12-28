import {h, lazy, render, Suspense, useState, useEffect, useLayout} from '../index.js'

describe('Suspense', () => {
	it('should suspend lazy loaded components suspense boundary', (done) => {
		const target = document.createElement('div')
		const stack = []
		const Lazy = lazy(() => {
			return new Promise(resolve => {
				setTimeout(resolve, 10, lazy(() => {
					return new Promise(resolve => {
						setTimeout(resolve, 10, h('p', {}, 'Tertiary'))
					})
				}))
			})
		})
		const Primary = props => {
			return h(Suspense, {fallback: 'Loading'}, h(Lazy), h(Secondary))
		}
		const Secondary = props => {
			useEffect(() => stack.push('useEffect'), [])
			useLayout(() => stack.push('useLayout'), [])
			return stack.push('Secondary')
		}

		render([h(Primary), h('p', {}, 'Sibling')], target, (current) => {
			assert.html(target, '<p>Tertiary</p>1<p>Sibling</p>')
			done(assert.deepEqual(stack, ['Secondary', 'useLayout', 'useEffect']))
		})

		assert.html(target, '<noscript>1</noscript>Loading<p>Sibling</p>')
		assert.deepEqual(stack, ['Secondary'])
	})

	it('should suspend a mounted suspense boundary', (done) => {
		const target = document.createElement('div')
		const stack = []
		const Lazy = lazy(() => {
			return new Promise(resolve => {
				setTimeout(resolve, 10, lazy(() => {
					return new Promise(resolve => {
						setTimeout(resolve, 10, h('p', {}, 'Tertiary'))
					})
				}))
			})
		})
		const Primary = props => {
			const [state, setState] = useState(false)
			useLayout(() => setState(true), [])
			return h(Suspense, {fallback: 'Loading'}, state && h(Lazy), h(Secondary))
		}
		const Secondary = props => {
			useEffect(() => stack.push('useEffect'), [])
			useLayout(() => stack.push('useLayout'), [])
			return stack.push('Secondary')
		}

		render([h(Primary), h('p', {}, 'Sibling')], target, (current) => {
			assert.html(target, '<p>Tertiary</p>3<p>Sibling</p>')
			done(assert.deepEqual(stack, ['Secondary', 'useLayout', 'Secondary', 'useEffect']))
		})

		assert.html(target, '3<p>Sibling</p>')
		assert.deepEqual(stack, ['Secondary', 'useLayout', 'Secondary'])
	})

	it('should suspend a pre-mounted suspense boundary', (done) => {
		const target = document.createElement('div')
		const stack = []
		const Lazy = lazy(() => {
			return new Promise(resolve => {
				setTimeout(resolve, 10, lazy(() => {
					return new Promise(resolve => {
						setTimeout(resolve, 10, h('p', {}, 'Tertiary'))
					})
				}))
			})
		})
		const Primary = props => {
			const [state, setState] = useState(false)
			useLayout(() => setState(true), [])
			return h(Suspense, {fallback: 'Loading'}, state && h(Lazy), h(Secondary))
		}
		const Secondary = props => {
			useEffect(() => stack.push('useEffect'), [])
			useLayout(() => stack.push('useLayout'), [])
			return stack.push('Secondary')
		}

		render([h(Primary), h('p', {}, 'Sibling')], target, () => {
			assert.html(target, '<p>Tertiary</p>3<p>Sibling</p>')
			done(assert.deepEqual(stack, ['Secondary', 'useLayout', 'Secondary', 'useEffect']))
		})

		assert.html(target, '3<p>Sibling</p>')
		assert.deepEqual(stack, ['Secondary', 'useLayout', 'Secondary'])
	})

	it('should invalidate lazy loaded component suspense boundary', (done) => {
		const target = document.createElement('div')
		const stack = []
		const Lazy = lazy(() => {
			return new Promise(resolve => {
				setTimeout(resolve, 10, lazy(() => {
					return new Promise(resolve => {
						setTimeout(resolve, 10, h('p', {}, 'Tertiary'))
					})
				}))
			})
		})
		const Primary = props => {
			return h(Suspense, {fallback: 'Loading'}, h(Lazy), h(Secondary))
		}
		const Secondary = props => {
			useLayout(() => stack.push('useLayout'), [])
			useEffect(() => stack.push('useEffect'), [])
			return stack.push('Secondary')
		}

		render([h(Primary), h('p', {}, 'Sibling')], target, (current) => {
			assert.html(target, '')
			done(assert.deepEqual(stack, ['Secondary']))
		})

		assert.html(target, '<noscript>1</noscript>Loading<p>Sibling</p>')
		assert.deepEqual(stack, ['Secondary'])

		render(null, target, (current) => {
			assert.html(target, '')
			assert.deepEqual(stack, ['Secondary'])
		})
	})

	it('should invalidate a mounted suspense boundary', (done) => {
		const target = document.createElement('div')
		const stack = []
		const Lazy = lazy(() => {
			return new Promise(resolve => {
				setTimeout(resolve, 10, lazy(() => {
					return new Promise(resolve => {
						setTimeout(resolve, 10, h('p', {}, 'Tertiary'))
					})
				}))
			})
		})
		const Primary = props => {
			const [state, setState] = useState(false)
			useLayout(() => setState(true), [])
			return h(Suspense, {fallback: 'Loading'}, state && h(Lazy), h(Secondary))
		}
		const Secondary = props => {
			useEffect(() => stack.push('useEffect'), [])
			useLayout(() => stack.push('useLayout'), [])
			return stack.push('Secondary')
		}

		render([h(Primary), h('p', {}, 'Sibling')], target, (current) => {
			assert.html(target, '')
			done(assert.deepEqual(stack, ['Secondary', 'useLayout', 'Secondary']))
		})

		assert.html(target, '3<p>Sibling</p>')
		assert.deepEqual(stack, ['Secondary', 'useLayout', 'Secondary'])

		render(null, target, (current) => {
			assert.html(target, '')
			assert.deepEqual(stack, ['Secondary', 'useLayout', 'Secondary'])
		})
	})

	it('should invalidate a pre-mounted suspense boundary', (done) => {
		const target = document.createElement('div')
		const stack = []
		const Lazy = lazy(() => {
			return new Promise(resolve => {
				setTimeout(resolve, 200, lazy(() => {
					return new Promise(resolve => {
						setTimeout(resolve, 800, props => h('p', {}, 'Tertiary'))
					})
				}))
			})
		})
		const Primary = props => {
			const [state, setState] = useState(false)
			useLayout(() => setState(true), [])
			return h(Suspense, {fallback: 'Loading'}, state && h(Lazy), h(Secondary))
		}
		const Secondary = props => {
			useEffect(() => stack.push('useEffect'), [])
			useLayout(() => stack.push('useLayout'), [])
			return stack.push('Secondary')
		}

		render([h(Primary), h('p', {}, 'Sibling')], target, () => {
			assert.html(target, '')
			done(assert.deepEqual(stack, ['Secondary', 'useLayout', 'Secondary']))
		})

		assert.html(target, '3<p>Sibling</p>')
		assert.deepEqual(stack, ['Secondary', 'useLayout', 'Secondary'])

		setTimeout(() => {
			render(null, target, (current) => {
				assert.html(target, '')
				assert.deepEqual(stack, ['Secondary', 'useLayout', 'Secondary'])
			})
		}, 200)
	})

	it('should suspend lazy loaded components outside of a suspense boundary', (done) => {
		const target = document.createElement('div')
		const stack = []
		const Lazy = lazy(() => {
			return new Promise(resolve => {
				setTimeout(resolve, 10, lazy(() => {
					return new Promise(resolve => {
						setTimeout(resolve, 10, h('p', {}, 'Tertiary'))
					})
				}))
			})
		})
		const Primary = props => {
			return [h(Lazy), h(Secondary)]
		}
		const Secondary = props => {
			useEffect(() => stack.push('useEffect'), [])
			useLayout(() => stack.push('useLayout'), [])
			return stack.push('Secondary')
		}

		render([h(Primary), h('p', {}, 'Sibling')], target, (current) => {
			assert.html(target, '<p>Tertiary</p>1<p>Sibling</p>')
			done(assert.deepEqual(stack, ['Secondary', 'useLayout', 'useEffect']))
		})

		assert.html(target, '1<p>Sibling</p>')
		assert.deepEqual(stack, ['Secondary'])
	})

	it('should defer and batch a suspense boundary updates', (done) => {
		const target = document.createElement('div')
		const stack = []
		const Lazy = lazy(() => {
			return new Promise(resolve => {
				setTimeout(resolve, 10, lazy(() => {
					return new Promise(resolve => {
						setTimeout(resolve, 10, h('p', {}, 'Tertiary'))
					})
				}))
			})
		})
		const Primary = props => {
			return h(Suspense, {fallback: 'Loading'}, h(Lazy), h(Secondary))
		}
		const Secondary = props => {
			useEffect(() => stack.push('useEffect'), [])
			useLayout(() => stack.push('useLayout'), [])
			return stack.push('Secondary')
		}

		render([h(Primary), h('p', {}, 'Sibling')], target, (current) => {
			assert.html(target, '<p>Tertiary</p>3<p>Updated</p>')
			done(assert.deepEqual(stack, ['Secondary', 'useLayout', 'Secondary', 'useEffect']))
		})

		assert.html(target, '<noscript>1</noscript>Loading<p>Sibling</p>')
		assert.deepEqual(stack, ['Secondary'])

		render([h(Primary), h('p', {}, 'Updated')], target, (current) => {
			assert.html(target, '<p>Tertiary</p>3<p>Updated</p>')
		})
	})

	it('should render and update an async component', (done) => {
		const target = document.createElement('div')
		const Primary = async function (props) { return props.children }

		render(h(Primary, {}, 1), target, (current) => {
			assert.html(current, '1')

			render(h(Primary, {}, 2), target, (current) => {
				done(assert.html(current, '2'))
			})
		})
	})

	it('should render and update an async component import', (done) => {
		const target = document.createElement('div')
		const Primary = async function (props) { return {default: props.children} }

		render(h(Primary, {}, 1), target, (current) => {
			assert.html(current, '1')

			render(h(Primary, {}, 2), target, (current) => {
				done(assert.html(current, '2'))
			})
		})
	})

	it('should pass props to async import', (done) => {
		const target = document.createElement('div')
		const Primary = props => props.children

		render(h(props => Promise.resolve({default: Primary}), {children: 1}), target, (current) => {
			done(assert.html(current, '1'))
		})
	})

	it('should render multiple async children', (done) => {
		const target = document.createElement('div')
		const Primary = props => props.children

		render(h(Primary, {}, Promise.resolve('1'), Promise.resolve('2')), target, (current) => {
			assert.html(current, '12')

			render(h(Primary, {}, Promise.resolve([h('div'), h('h1', {}, '1')])), target, (current) => {
				done(assert.html(current, '<div></div><h1>1</h1>'))
			})
		})
	})

	it('should not update unmounted async children', () => {
		const target = document.createElement('div')
		const Primary = props => props.children

		render(h(Primary, {}, Promise.resolve('1')), target)
		render(null, target)

		assert.html(target, '')
	})

	it('should render cached lazy components', (done) => {
	  const target = document.createElement('div')
	  const Primary = props => new Promise(resolve => setTimeout(resolve, 600, {default: props => `Primary ${props.value}`}))
	  const Secondary = props => new Promise(resolve => setTimeout(resolve, 700, {default: props => `Secondary ${props.value}`}))

	  render(h(Suspense, {fallback: 'Load!'}, h(Primary, {value: 'World!'})), target, (current) => {
	    assert.html(current, 'Primary World!')

	    render(h(Suspense, {fallback: 'Load!'}, h(Secondary, {value: 'Earth!'})), target, (current) => {
	      assert.html(current, 'Secondary Earth!')

	      render(h(Suspense, {fallback: 'Load!'}, h(Primary, {value: 'World!'})), target, (current) => {
	        done(assert.html(current, 'Primary World!'))
	      })
	    })
	  })

	  assert.html(target, '<noscript></noscript>Load!')
	})

	it('should use an async render callback', (done) => {
	  const target = document.createElement('div')
	  const stack = []
	  const Primary = props => Promise.resolve(1)

	  render(h(Primary), target, async (current) => {
	    stack.push(1)
	    await new Promise(resolve => setTimeout(resolve, 100))
	    stack.push(2)
	  }).then((current) => {
	    stack.push(3)
	  }).then((current) => {
	  	assert.html(current, '1')
	    done(assert.deepEqual(stack, [1, 2, 3]))
	  })
	})
})
