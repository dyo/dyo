describe('Context', () => {
	it('should provide child context', () => {
		let container = document.createElement('div')
		let counter = 0
		let stack = []
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
							render(props, state, context) {
								return class {
									render(props, state, {children}) {
										stack.push(context === this.context)

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
		assert.deepEqual(stack, [true])
	})

	it('should update child context', () => {
		let container = document.createElement('div')
		let counter = 0
		let A = class A {
			getChildContext() {
				return {
					children: counter++
				}
			}
			render() {
				return class {
					render() {
						return class {
							render() {
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

	it('should update child context reference', () => {
		let container = document.createElement('div')
		let stack = []
		let refs = null
		let context = {
			children: 1,
			get spy() {
				this.children--
			},
			set spy(_) {}
		}
		let A = class {
			getChildContext(nextProps, nextState) {
				stack.push(`state-stable:${this.state === nextState}`)
				return context
			}
			render() {
				return class {
					render() {
						return class {
							render(props, state, {children}) {
								return class {
									componentDidMount() {
										stack.push(this.context !== context)
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
		render(h(A, {ref: node => refs = node}), container)

		refs.setState({})

		assert.html(container, '-1')
		assert.propertyVal(context, 'children', -2)
		assert.deepEqual(stack, ['state-stable:true', true, 'state-stable:true', true, 'state-stable:true', true])
	})

	it('should update child context with shouldComponentUpdate:false ', () => {
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

	it('should not call getChildContext when shouldComponentUpdate returns false', () => {
		let container = document.createElement('div')
		let stack = []
		let A = class {
			getChildContext(props, state, context) {
				stack.push('getChildContext')
			}
			shouldComponentUpdate() {
				return false
			}
			render() {

			}
		}

		render(h('div', h(A)), container)
		render(h('div', h(A)), container)

		assert.html(container, '<div></div>')
		assert.deepEqual(stack, ['getChildContext'])
	})

	it('should mount/update/unmount context provider/consumer', () => {
		let container = document.createElement('div')
    let Context = createContext(1)

    let Consumer = class {
    	render(props) {
    		return (
    			h(Context.Consumer, value => h('span', value))
    		)
    	}
    }

    let Indirection = class {
    	render() {
    		return this.props.children
    	}
    }

    let App = class {
    	render(props) {
	      return (
	      	h(Context.Provider, {value: props.value},
	      		h(Indirection,
	      			h(Indirection,
	      				h(Consumer)
	      			)
	      		)
	      	)
	      )
    	}
    }

    render(h(App, {value: 2}), container)
    assert.html(container, `<span>2</span>`)

    render(h(App, {value: 3}), container)
    assert.html(container, `<span>3</span>`)

    render(null, container)
    assert.html(container, '')
  })

  it('should propagates through shouldComponentUpdate:false', () => {
		let container = document.createElement('div')
    let Context = createContext(1)

    let Provider = class {
    	render(props) {
    		return (
    			h(Context.Provider, {value: props.value}, props.children)
    		)
    	}
    }

    let Consumer = class {
    	render(props) {
    		return (
    			h(Context.Consumer, value => h('span', value))
    		)
    	}
    }

    let Indirection = class {
    	shouldComponentUpdate() {
    		return false
    	}
    	render() {
    		return this.props.children
    	}
    }

    let App = class {
    	render(props) {
	      return (
	      	h(Provider, {value: props.value},
	      		h(Indirection,
	      			h(Indirection,
	      				h(Consumer)
	      			)
	      		)
	      	)
	      )
    	}
    }

    render(h(App, {value: 2}), container)
    assert.html(container, `<span>2</span>`)

    render(h(App, {value: 3}), container)
    assert.html(container, `<span>3</span>`)

    render(null, container)
    assert.html(container, '')
  })

  it('should handle nested providers', () => {
		let container = document.createElement('div')
    let Context = createContext(1)

    let Provider = class {
      render(props) {
      	return (
      		h(Context.Consumer, contextValue => (
      			h(Context.Provider, {value: props.value || contextValue * 2}, props.children)
      		))
      	)
      }
    }

    let Consumer = class {
    	render(props) {
    		return (
    			h(Context.Consumer, value => h('span', value))
    		)
    	}
    }

    let Indirection = class {
      shouldComponentUpdate() {
        return false
      }
      render() {
        return this.props.children
      }
    }

    let App = class {
    	render(props) {
	      return (
	      	h(Provider, {value: props.value},
	      		h(Indirection,
	      			h(Provider,
	      				h(Indirection,
	      					h(Provider,
	      						h(Indirection,
	      							h(Consumer)
	      						)
	      					)
	      				)
	      			)
	      		)
	      	)
	      )
    	}
  	}

    render(h(App, {value: 2}), container)
    assert.html(container, `<span>8</span>`)

    render(h(App, {value: 3}), container)
    assert.html(container, `<span>12</span>`)

    render(null, container)
    assert.html(container, '')
  })

  it('multiple consumers in different branches', () => {
		let container = document.createElement('div')
    let Context = createContext(1)

    let Provider = class {
      render(props) {
      	return (
      		h(Context.Consumer, contextValue => (
      			h(Context.Provider, {value: props.value || contextValue * 2},
      				props.children
      			)
      		))
      	)
      }
    }

    let Consumer = class {
    	render(props) {
    		return (
    			h(Context.Consumer, value => h('span', value))
    		)
    	}
    }

    let Indirection = class {
      shouldComponentUpdate() {
        return false
      }
      render() {
        return this.props.children
      }
    }

    let App = class {
    	render(props) {
	      return (
	      	h(Provider, {value: props.value},
	      		h(Indirection,
	      			h(Indirection,
	      				h(Provider,
	      					h(Consumer)
	      				)
	      			),
	      			h(Indirection,
	      				h(Consumer)
	      			)
	      		)
	      	)
	      )
    	}
  	}

    render(h(App, {value: 2}), container)
    assert.html(container, `<span>4</span><span>2</span>`)

    render(h(App, {value: 3}), container)
    assert.html(container, `<span>6</span><span>3</span>`)

    render(h(App, {value: 4}), container)
    assert.html(container, `<span>8</span><span>4</span>`)

    render(null, container)
    assert.html(container, '')
  })

  it('should compare context values with Object.is semantics', () => {
		let container = document.createElement('div')
		let stack = []
    let Context = createContext(1)

    let Provider = class {
    	render(props) {
    		stack.push('Provider')

    		return (
    			h(Context.Provider, {value: props.value}, props.children)
    		)
    	}
    }

    let Consumer = class {
    	render(props) {
    		stack.push('Consumer')

    		return (
    			h(Context.Consumer, value => {
    				stack.push('Consumer render prop')

    				return h('span', value)
    			})
    		)
    	}
    }

    let Indirection = class {
      shouldComponentUpdate() {
        return false
      }
      render() {
      	stack.push('Indirection')

        return this.props.children
      }
    }

    let App = class {
    	render(props) {
    		stack.push('App')

	      return (
	      	h(Provider, {value: props.value},
	      		h(Indirection,
	      			h(Indirection,
	      				h(Consumer)
	      			)
	      		)
	      	)
	      )
    	}
  	}

    render(h(App, {value: NaN}), container)
    assert.html(container, `<span>NaN</span>`)
    assert.deepEqual(stack, ['App', 'Provider', 'Indirection', 'Indirection', 'Consumer', 'Consumer render prop'])

    stack.length = 0

    render(h(App, {value: NaN}), container)
    assert.html(container, `<span>NaN</span>`)
    assert.deepEqual(stack, ['App', 'Provider'])

    render(null, container)
    assert.html(container, '')
  })

  it('should provide the correct (default) values to consumers outside of a provider', () => {
  	let container = document.createElement('div')
  	let stack = []
    let FooContext = createContext({value: 'foo-initial'})
    let BarContext = createContext({value: 'bar-initial'})

    let Text = class {
    	componentDidMount() {
    		stack.push(this.props.value)
    	}
    	render({value}) {
	    	return h('span', value)
	    }
    }

    render(
      h(Fragment,
      	h(BarContext.Provider, {value: {value: 'bar-updated'}},
        	h(BarContext.Consumer, ({value}) => h(Text, {value: value})),
          h(FooContext.Provider, {value: {value: 'foo-updated'}},
						h(FooContext.Consumer, ({value}) => h(Text, {value: value}))
          )
      	),
      	h(FooContext.Consumer, ({value}) => h(Text, {value: value})),
      	h(BarContext.Consumer, ({value}) => h(Text, {value: value}))
      ),
      container
    )

    assert.deepEqual(stack, ['bar-updated', 'foo-updated', 'foo-initial', 'bar-initial'])
    assert.html(container, `
			<span>bar-updated</span>
			<span>foo-updated</span>
			<span>foo-initial</span>
			<span>bar-initial</span>
    `)

    render(null, container)
    assert.html(container, '')
  })

  it('should not run into infinite loops', () => {
  	let container = document.createElement('div')
  	let refs = null

  	let people = [
  	  {id: 1, name: "Bob", dateOfBirth: "12/12/1980"},
  	  {id: 2, name: "Brenda", dateOfBirth: "01/06/1970"}
  	]

  	let Context = createContext(null)

  	let List = ({ ascending }) => {
  	  let sortedPeople = [...people].sort(
  	    (personA, personB) => (ascending ? -1 : 1) * (personA.name < personB.name ? 1 : -1)
  	  );

  	  let list = sortedPeople.map(person =>
  	    h("tr", {key: person.id},
  	      h("td", h(Link, person.name)),
  	      h("td", person.dateOfBirth)
  	    )
  	  )

  	  return (
  	  	h("div",
  		    h("table",
  		      h("thead",
  		        h("tr",
  		          h("th", h(Link, {href: "#"},"Name")),
  		          h("th", "Date of Birth")
  		        )
  		      ),
  		      h("tbody", list)
  		    )
  	  	)
  	  );
  	};

  	let Link = ({ children, href }) => {
  	  return (
  	  	h(Context.Consumer,
  	  		({ update }) => {
  	  			return (
  	  				h("a",
  		  			  {
  		  			  	id: 'btn',
  		  			    href: href,
  		  			    ref: (node) => refs = node,
  		  			    onClick: () => {
  		  			      update();
  		  			      return false;
  		  			    }
  		  			  },
  		  			  children
  		  			)
  	  			)
  		  	}
  		  )
  	  );
  	}

  	class App {
  	  constructor(props) {
  	    this.state = {
  	      ascending: true
  	    };
  	  }

  	  render() {
  	    return h(Context.Provider,
  	      {
  	        value: {
  	          update: () => {
  	            this.setState(({ ascending }) => {
  	              return {
  	                ascending: !ascending
  	              };
  	            });
  	          },
  	          ascending: this.state.ascending
  	        }
  	      },
  	      this.props.children
  	    );
  	  }
  	}

  	assert.doesNotThrow(() => {
  		render(
  		  h(App,
  		    h(Context.Consumer,
  		    	({ ascending }) => {
  		    		return (
  		    			h(List, {
  		        		ascending: ascending
  		      		})
  		    		)
  		    	}
  		    )
  		  ),
  		  container
  		)
  	})

  	assert.html(container, `
			<div>
				<table>
					<thead>
						<tr>
							<th><a id="btn" href="#">Name</a></th><th>Date of Birth</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><a id="btn">Bob</a></td>
							<td>12/12/1980</td>
						</tr>
						<tr>
							<td><a id="btn">Brenda</a></td>
							<td>01/06/1970</td>
						</tr>
					</tbody>
				</table>
			</div>
  	`)

  	assert.doesNotThrow(() => {
  		refs.dispatchEvent(new Event('click'))
  	})

  	assert.html(container, `
			<div>
				<table>
					<thead>
						<tr>
							<th><a id="btn" href="#">Name</a></th><th>Date of Birth</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><a id="btn">Brenda</a></td>
							<td>01/06/1970</td>
						</tr>
						<tr>
							<td><a id="btn">Bob</a></td>
							<td>12/12/1980</td>
						</tr>
					</tbody>
				</table>
			</div>
  	`)
  })

  it('should co-exist with old context', () => {
  	let container = document.createElement('div')
  	let stack = ['red', 'blue', 'orange']
  	let index = 0
  	let refs1 = null
  	let refs2 = null

  	class A extends Component {
  	  constructor(props) {
  	    super(props)
  	    this.state = {
  	      count: 0
  	    };
  	    this.countUp = this.countUp.bind(this)
  	  }

  	  getChildContext(nextProps, nextState) {
  	    return {
  	      ...this.context,
  	      count: this.state.count,
  	      countUp: this.countUp
  	    };
  	  }

  	  render() {
  	    return this.props.children
  	  }

  	  countUp() {
  	    this.setState(({ count }) => {
  	    	return { count: count + 1 }
  	    })
  	  }
  	}

  	const {Provider, Consumer} = createContext()

  	class B extends Component {
  	  constructor(props) {
  	    super(props)
  	    this.state = {
  	      color: randomHexColor(),
  	      newColor: this.newColor.bind(this)
  	    }
  	  }

  	  render() {
  	    return (
  	    	h(Provider, {value: this.state}, this.props.children)
  	    )
  	  }

  	  newColor() {
  	    const color = randomHexColor()
  	    this.setState(() => ({ color }))
  	  }
  	}

  	function randomHexColor() {
  		return stack[index++]
  	}

  	class C extends Component {
  	  render() {
  	    return (
  	    	h(Consumer, ctx => (
  	    		h(Fragment,
  	    			h(D, {color: ctx.color}),
  	    			h('button', {ref: (node) => refs2 = node, onClick: ctx.newColor}, 'Colors!')
  	    		)
  	    	))
  	    )
  	  }
  	}

  	class D extends Component {
  	  render() {
  	    return (
  	    	h('button', {ref: (node) => refs1 = node, style: {color: this.props.color}, onClick: this.context.countUp},
  	    		this.context.count
  	    	)
  	    )
  	  }
  	}

  	render(h(A, h(B, h(C))), container)
  	assert.html(container, `<button style="color: red;">0</button><button>Colors!</button>`)

  	refs1.dispatchEvent(new Event('click'))
  	assert.html(container, `<button style="color: red;">1</button><button>Colors!</button>`)

  	refs1.dispatchEvent(new Event('click'))
  	assert.html(container, `<button style="color: red;">2</button><button>Colors!</button>`)

  	refs2.dispatchEvent(new Event('click'))
  	assert.html(container, `<button style="color: blue;">2</button><button>Colors!</button>`)

  	refs2.dispatchEvent(new Event('click'))
  	assert.html(container, `<button style="color: orange;">2</button><button>Colors!</button>`)
  })
})
