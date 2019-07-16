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
			useLayout(() => stack.push('useEffect'), [])
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

	it('should defer and batch a suspensed boundaries updates', (done) => {
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
})
