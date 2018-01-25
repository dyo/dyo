describe('Context', () => {
	it('should provide child context', () => {
		let container = document.createElement('div')
		let counter = 0
		let A = class {
			getChildContext() {
				return {
					children: counter++
				}
			}
			render() {
				return class {
					render() {
						return class {
							render(props, state, {children}) {
								return class {
									render(props, state, {children}) {
										return children
									}
								}
							}
						}
					}
				}
			}
		}

		render(A, container)

		assert.html(container, '0')
	})

	it('should update child context', () => {
		let container = document.createElement('div')
		let counter = 0
		let A = class {
			getChildContext() {
				return {
					children: counter++
				}
			}
			render() {
				return class {
					render() {
						return class {
							render(props, state, {children}) {
								return class {
									render(props, state, {children}) {
										return children
									}
								}
							}
						}
					}
				}
			}
		}

		render(A, container)
		render(A, container)

		assert.html(container, '1')
	})

	it('should not update child context reference', () => {
		let container = document.createElement('div')
		let stack = []
		let context = {
			children: 1,
			get spy() {
				this.children--
			}
		}
		let A = class {
			getChildContext() {
				return context
			}
			render() {
				return class {
					render() {
						return class {
							render(props, state, {children}) {
								return class {
									componentDidMount() {
										stack.push(this.context === context)
									}
									render(props, state, {children}) {
										return children
									}
								}
							}
						}
					}
				}
			}
		}

		render(A, container)
		render(A, container)

		assert.html(container, '1')
		assert.propertyVal(context, 'children', 1)
		assert.deepEqual(stack, [true, true])
	})

	it('should update child context with shouldComponentUpdate(false) ', () => {
		let container = document.createElement('div')
		let counter = 0
		let A = class {
			getChildContext() {
				return {
					children: counter++
				}
			}
			render() {
				return class {
					render() {
						return class {
							shouldComponentUpdate() {
								return false
							}
							render(props, state, {children}) {
								return class {
									render(props, state, {children}) {
										return children
									}
								}
							}
						}
					}
				}
			}
		}

		render(A, container)
		render(A, container)

		assert.html(container, '1')
	})

	it('should branch child context', () => {
		let container = document.createElement('div')
		let counter = 0
		let A = class {
			getChildContext() {
				return {
					children: counter++
				}
			}
			render() {
				return class {
					render() {
						return class {
							getChildContext(props, state, context) {
								return {
									children: context.children + 1
								}
							}
							render(props, state, {children}) {
								return class {
									render(props, state, {children}) {
										return children
									}
								}
							}
						}
					}
				}
			}
		}

		render(A, container)

		assert.html(container, '1')
	})

	it('should always set an object as child context', () => {
		let container = document.createElement('div')
		let stack = []
		let A = class {
			getChildContext() {

			}
			render() {
				return class {
					render() {
						return class {
							render(props, state, {children}) {
								return class {
									render(props, state, context) {
										stack.push(context != null)
									}
								}
							}
						}
					}
				}
			}
		}

		render(h('div', A), container)

		assert.html(container, '<div></div>')
		assert.include(stack, true)
	})

	it('should pass new state, props and context to getChildContext', () => {
		let container = document.createElement('div')
		let stack = []
		let A = class {
			getInitialState() {
				return {
					updated: false
				}
			}
			getChildContext(props, state, context) {
				context.updated && stack.push('error')
				state.updated && stack.push('state')
				props.updated && stack.push('props')

				return {
					updated: true
				}
			}
			shouldComponentUpdate() {
				return false
			}
			componentDidMount() {
				return {
					updated: true
				}
			}
			render() {

			}
		}

		render(h('div', h(A, {updated: false})), container)
		render(h('div', h(A, {updated: true})), container)

		assert.html(container, '<div></div>')
		assert.include(stack, 'state')
		assert.include(stack, 'props')
		assert.notInclude(stack, 'error')
	})
})
