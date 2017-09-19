describe('Fixture', () => {
	it('should reconcile no-op', () => {
		let container = document.body.appendChild(document.createElement('div'))
		let stack = []
		let X = () => h('div', 'x')
		let List = class {
			constructor() {
				setState = this.setState.bind(this)
			}
			getInitialState() {
				return {
					on: false
				}
			}
			render() {
				return h('div', 
					this.state.on === true ? X : void 0, 
					h('div', 'y'), 
					this.state.on === true ? X : void 0
				)
			}
		}

		let setState = null

		render(h(List), container)
		assert.html(container, '<div><div>y</div></div>')

		setState({on: true})
		assert.html(container, '<div><div>x</div><div>y</div><div>x</div></div>')
		
		setState({on: true})
		assert.html(container, '<div><div>x</div><div>y</div><div>x</div></div>')
	})

	it('should use implicit keys', () => {
		let container = document.createElement('div')
		let stack = []
		let Y = () => h('div', 'y')
		let X = class {
			constructor() {
				setState = this.setState.bind(this)
			}
			getInitialState() {
				return {
					x: false, 
					arr: [Y, Y, Y]
				}
			}
			render(props, {x, arr}) {
				return h('div', (this.state.x ? [this.state.arr[0]] : this.state.arr).concat([h('div')]))
			}
		}

		let setState = null

		render(X, container)
		assert.html(container, '<div><div>y</div><div>y</div><div>y</div><div></div></div>')
		setState({x: true})
		assert.html(container, '<div><div>y</div><div></div></div>')
	})

	it('should handle calling forceUpdate from Render', (done) => {
		let container = document.createElement('div')
		let C = class {
			render() {
				if (updated === false) {
				  updated = true
				  this.forceUpdate()
				}
				return h('div', 'child')
			}
		}
		let P = class {
			constructor() {
				setState = this.setState.bind(this)
			}
			getInitialState() {
				return {
				  test: false
				}
			}
			render(props, {change, test}) {
			  if (updated2 === false) {
			    updated2 = true
			    this.forceUpdate()
			  }

			  if (change)
			  	return h('p',
			  		[
				  		h('form'), 
				  		this.state.test ? C : void 0
				  	].filter(Boolean) 
				  )

			  return h('p', h('form', 'x'), test ? C : [])
			}
		}

		let setState = null
		let updated = false
		let updated2 = false
		
		render(h(P), container)

		setState({test: true}, () => {
			assert.html(container, '<p><form>x</form><div>child</div></p>', 'call forceUpdate from render')

			setState({
				change: true,
			  test: true
			}, () => {
				assert.html(container, '<p><form></form><div>child</div></p>', 'handle async mutations')
				done()
			})
		})
	})

	it('should handle handle mutable elements', (done) => {
		let container = document.createElement('div')
		let without = (array, filtered) => array.filter(n => n != filtered)

		class Ripple {
			getInitialState() {
				return {
					$waves: []
				}
			}
			ripple({$$el}) {
				let $wave = h('div', {class: 'wave', key: 'a'}, 'wave')
				
				this.setState({$waves: this.state.$waves.concat($wave)}, () => {
					nextTick(() => {
						this.setState({$waves: without(this.state.$waves, $wave)})
					})
				})				
			}
			render() {
				return h('div', {
					class: 'ripple', onmousedown: (e) => this.ripple({$$el: e.currentTarget})
				}, this.state.$waves)
			}
		}

		render(h(Ripple), container)

		let r = container.querySelector('.ripple')
		let event = new Event('mousedown')

		r.dispatchEvent(event)
		r.dispatchEvent(event)

		nextTick(() => {
			r.dispatchEvent(event)
			r.dispatchEvent(event)

			nextTick(() => {
				assert.html(container, '<div class="ripple"></div>', 'handle hoisted elements')
				done()
			})
		})
	})
})
