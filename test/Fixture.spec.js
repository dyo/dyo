describe('Fixture', () => {
	let umdfile = '../dist/umd'
	let pkgfile = '../package.json'

	it('should no-op reconcile', () => {
		let container = document.createElement('div')
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

	it('should handle calling forceUpdate from render', (done) => {
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

	it('should handle static elements', (done) => {
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

	it('should handle replacing static elements', () => {
		let container = document.createElement('div')
		let element = h('span')
		let A = class {
			render({showText}) {
				return h('div', showText ? 'test' : element)
			}
		}

		render(h(A, {showText: false}), container)
		assert.html(container, `<div><span></span></div>`)

		render(h(A, {showText: true}), container)
		assert.html(container, `<div>test</div>`)

		render(h(A, {showText: false}), container)
		assert.html(container, `<div><span></span></div>`)
	})

	it('should handle duplicate static children', () => {
		let container = document.createElement('div')
		let element = h('h1', 'x')

		render(h('div', h('h2', 'x'), element, element, h('h2', 'y')), container)
		assert.html(container, `
			<div>
				<h2>x</h2>
				<h1>x</h1>
				<h1>x</h1>
				<h2>y</h2>
			</div>
		`)

		render(h('div', h('h2', 'x'), element, h('h2', 'z'), element, h('h2', 'y')), container)
		assert.html(container, `
			<div>
				<h2>x</h2>
				<h1>x</h1>
				<h2>z</h2>
				<h1>x</h1>
				<h2>y</h2>
			</div>
		`)

		render(h('div', h('h2', 'x'), element, element, h('h2', 'y')), container)
		assert.html(container, `
			<div>
				<h2>x</h2>
				<h1>x</h1>
				<h1>x</h1>
				<h2>y</h2>
			</div>
		`)
	})

	it('should handle duplicate static siblings', () => {
		let container = document.createElement('div')
		let element = h('h1', {key: 'x'}, 'x')

		render(h('div', h('h2', 'x'), element, element, h('h2', 'y')), container)
		assert.html(container, `
			<div>
				<h2>x</h2>
				<h1>x</h1>
				<h1>x</h1>
				<h2>y</h2>
			</div>
		`)

		render(h('div', h('h2', 'x'), element, h('h2', 'z'), element, h('h2', 'y')), container)
		assert.html(container, `
			<div>
				<h2>x</h2>
				<h1>x</h1>
				<h2>z</h2>
				<h1>x</h1>
				<h2>y</h2>
			</div>
		`)

		render(h('div', h('h2', 'x'), element, element, h('h2', 'y')), container)
		assert.html(container, `
			<div>
				<h2>x</h2>
				<h1>x</h1>
				<h1>x</h1>
				<h2>y</h2>
			</div>
		`)
	})

	it('should handle static children', () => {
		let container = document.createElement('div')
		let stack = []

		let A = () => h('div', 'A')
		A.componentDidMount = () => stack.push('mount A')
		A.componentWillUnmount = () => stack.push('unmount A')

		let B = () => h('div', 'B')
		B.componentDidMount = () => stack.push('mount B')
		B.componentWillUnmount = () => stack.push('unmount B')

		let setState = null
		let cachedState = null

		let Parent = function () {
			setState = this.setState.bind(this)
			return h('div', this.state.child)
		}
		Parent.getInitialState = () => cachedState || {child: h('div', A)}

		let setStateRoot = null

		let Root = function (props, state) {
			setStateRoot = this.setState.bind(this)
			return h('div', this.state.isMounted ? Parent : null)
		}
		Root.getInitialState = () => ({isMounted: true})

		// mount A
		render(Root, container)
		assert.html(container, `<div><div><div><div>A</div></div></div></div>`)

		// mount B, unmount A
		setState(cachedState = {child: h('div', B, '!!!')})
		assert.html(container, `<div><div><div><div>B</div>!!!</div></div></div>`)

		// unmount B
		setStateRoot({isMounted: false})
		assert.html(container, `<div></div>`)

		// mount B
		setStateRoot({isMounted: true})
		assert.html(container, `<div><div><div><div>B</div>!!!</div></div></div>`)

		// mount A, unmount B
		setState({child: h('div', A)})
		assert.html(container, `<div><div><div><div>A</div></div></div></div>`)

		// unmount A
		setStateRoot({isMounted: false})
		assert.html(container, `<div></div>`)

		assert.deepEqual(stack, [
			'mount A',
			'unmount A',
			'mount B',
			'unmount B',
			'mount B',
			'unmount B',
			'mount A',
			'unmount A'
		])
	})

	it('should not remove children from empty children', () => {
		let element = h('h1', 1)
		let children = element.children
		let child = children.next
		let next = null

		next = children.remove(child)
		assert.lengthOf(children, 0)
		assert.equal(next, child)

		next = children.remove(next)
		assert.lengthOf(children, 0)
		assert.equal(next, child)
	})

	it('should render conditional components', (done) => {
		let container = document.createElement('div')
		let idx = 0
		let msgs = ['A','B','C','D','E','F','G','H']

		class Comp extends Component {
			componentWillMount() {
				this.innerMsg = msgs[(idx++ % 8)]
			}
			render() {
				return h('div', this.innerMsg)
			}
		}

		class GoodContainer extends Component {
			constructor(props) {
				super(props)
				this.state = { alt: false }
			}
			componentDidMount() {
				this.setState({ alt: true })
			}
			render() {
				let alt = this.state.alt

				return (
					h('div',
						null,
						alt ? null : h(Comp, {alt: alt}),
						alt ? null : h(Comp, {alt: alt}),
						alt ? h(Comp, {alt: alt}) : null,
						alt ? h(Comp, {alt: alt}) : null
					)
				)
			}
		}

		render(h(GoodContainer), container)

		nextTick(() => {
			assert.html(container, `
				<div>
					<div>C</div>
					<div>D</div>
				</div>
			`)
			done()
		})
	})

	it('should always execute setState callback', (done) => {
		let container = document.createElement('div')
		let stack = []
		let refs = null

		class App extends Component {
			getInitialState() {
				return {
					count: 0
				}
			}
			componentWillMount() {
				this.setState({count: 1}, () => {
					stack.push('setState')
				})

				this.forceUpdate(() => {
					stack.push('forceUpdate')
				})
			}
			componentDidMount() {
				this.setState({count: 3}, () => {
					stack.push('didMount')
				})
			}
			componentDidUpdate() {
				stack.push('didUpdate')
			}
			inc() {
				this.setState({
					count: this.state.count + 1
				})
			}
			dec() {
				this.setState({
					count: this.state.count - 1
				})
			}
			render() {
				return h('div',
					h('h2', this.state.count),
					h('button', {onClick: this.inc, ref: (value) => refs = value}, 'Increment'),
					h('button', {onClick: this.dec}, 'Decrement')
				)
			}
		}

		render(App, container)

		nextTick(() => {
			assert.html(container, '<div><h2>3</h2><button>Increment</button><button>Decrement</button></div>')

			refs.dispatchEvent(new Event('click'))

			assert.html(container, '<div><h2>4</h2><button>Increment</button><button>Decrement</button></div>')
			assert.include(stack, 'setState')
			assert.include(stack, 'forceUpdate')
			assert.include(stack, 'didMount')
			assert.include(stack, 'didUpdate')
			done()
		})
	})

	it('should handle alternating dangerouslySetInnerHTML', () => {
		let container = document.createElement('div')
		let A = class {
			render({alt}) {
				return alt ? h('div', h('h1')) : h('div', {dangerouslySetInnerHTML: {__html: '<span></span>'}})
			}
		}

		assert.doesNotThrow(() => {
			render(h(A, {alt: true}), container)
			assert.html(container, `<div><h1></h1></div>`)

			render(h(A, {alt: false}), container)
			assert.html(container, `<div><span></span></div>`)

			render(h(A, {alt: true}), container)
			assert.html(container, `<div><h1></h1></div>`)

			render(h(A, {alt: false}), container)
			assert.html(container, `<div><span></span></div>`)
		})
	})

	it('should fallback to polyfills', () => {
		let container = document.createElement('div')
		let stack = []
		let WeakMap = global.WeakMap
		let Symbol = global.Symbol
		let Promise = global.Promise

		delete require.cache[require.resolve(umdfile)]

		global.WeakMap = undefined
		global.Symbol = undefined
		global.Promise = undefined

		assert.equal(global.WeakMap, undefined)
		assert.equal(global.Symbol, undefined)
		assert.equal(global.Promise, undefined)

		let {render, h} = require(umdfile)
		let A = class {
			componentWillUnmount() {
				stack.push('should not push')
			}
			render({children}) {
				return children
			}
		}

		assert.doesNotThrow(() => {
			render(h(A, 1), container)
			render(h(A, 2), container)
		})

		assert.html(container, '2')
		assert.lengthOf(stack, 0)

		global.WeakMap = WeakMap
		global.Symbol = Symbol
		global.Promise = Promise

		delete require.cache[require.resolve(umdfile)]

		assert.equal(global.WeakMap, WeakMap)
		assert.equal(global.Symbol, Symbol)
		assert.notEqual(render, global.render)
	})

	it('should not hit the require branch when bundling with webpack', () => {
		let container = document.createElement('div')
		let module = {exports: {}}
		let __webpack_require__ = () => {throw 'fail'}
		let source = require('fs').readFileSync(require.resolve(umdfile), 'utf8')

		__webpack_require__.include = () => {}

		eval(`(function (module, exports, require) {${source}})(module, module.exports, __webpack_require__)`)

		assert.doesNotHaveAnyKeys(module.exports, ['renderToString', 'renderToNodeStream'])
		assert.hasAnyKeys(module.exports, ['render', 'createElement'])
	})

	it('should establish communication between parent and children with events & context', () => {
		let container = document.createElement('div')

		let Option = class {
			render({children, value}, state, {active, open, handleEvent}) {
				if (active === value || open === true)
					return h('div', {onClick: handleEvent, active: active === value}, children)
			}
		}

		let Select = class {
			getChildContext(props, {open, active}) {
				return {open: open, active: active, handleEvent: this}
			}
			getInitialState({value}) {
				return {open: false, active: value}
			}
			handleEvent(e, {value}, state, {open}) {
				return {open: !open, active: value}
			}
			render({style, children}) {
				return h('div', children)
			}
		}

		let First = () => h(Option, {value: 1}, 'First')
		let Second = () => h(Option, {value: 2}, 'Second')

		render(h(Select, {value: 1},
			h(First),
			h(Second),
			h(Option, {value: 3}, 'Third')
		), container)

		assert.html(container, `
			<div>
				<div active="">First</div>
			</div>
		`)

		let select = container.firstChild
		let event = new Event('click')

		select.firstChild.dispatchEvent(event)
		assert.html(container, `
			<div>
				<div active="">First</div>
				<div>Second</div>
				<div>Third</div>
			</div>
		`)

		select.firstChild.dispatchEvent(event)
		assert.html(container, `
			<div>
				<div active="">First</div>
			</div>
		`)

		select.firstChild.dispatchEvent(event)
		assert.html(container, `
			<div>
				<div active="">First</div>
				<div>Second</div>
				<div>Third</div>
			</div>
		`)

		select.firstChild.nextSibling.dispatchEvent(event)
		assert.html(container, `
			<div>
				<div active="">Second</div>
			</div>
		`)

		select.firstChild.nextSibling.dispatchEvent(event)
		assert.html(container, `
			<div>
				<div>First</div>
				<div active="">Second</div>
				<div>Third</div>
			</div>
		`)

		select.lastChild.dispatchEvent(event)
		assert.html(container, `
			<div>
				<div active="">Third</div>
			</div>
		`)

		select.lastChild.dispatchEvent(event)
		assert.html(container, `
			<div>
				<div>First</div>
				<div>Second</div>
				<div active="">Third</div>
			</div>
		`)

		select.firstChild.dispatchEvent(event)
		assert.html(container, `
			<div>
				<div active="">First</div>
			</div>
		`)
	})

	it('should establish communication between multple components to implement a router', () => {
		let container = document.createElement('div')
		let stack = []

		class Route {
			render({path, children}, state, {active, match}) {
				return active === path ? h(children, {match: match}) : null
			}
		}

		class Link {
			render(props) {
				return h('a', Object.assign({}, props, {onClick: this}))
			}
			handleEvent(event, {href, title}, state, {router}) {
				event.preventDefault()
				router.pushState({}, title, href, event)
			}
		}

		class Router {
			componentWillMount() {
				addEventListener('popstate', this)
			}
			componentWillUnmount() {
				stack.push(true)
				removeEventListener('popstate', this)
			}
			getChildContext() {
				return {
					router: this,
					active: this.getActive(),
					match: null
				}
			}
			render({children}) {
				return children
			}
			getActive() {
				return location.pathname
			}
			pushState (state, title, href, event) {
				history.pushState(state, title, href)
				this.handleEvent(event)
			}
			handleEvent() {
				this.forceUpdate()
			}
		}

		let BasicExample = () => (
			h(Router,
				h('div',
					h('ul',
						h('li', h(Link, {href: '/'}, 'Home')),
						h('li', h(Link, {href: '/about'}, 'About')),
						h('li', h(Link, {href: '/topic'}, 'Topic'))
					),
					h('hr'),
					h(Route, {path: '/'}, Home),
					h(Route, {path: '/about'}, About),
					h(Route, {path: '/topic'}, Topic)
				)
			)
		)

		let Home = () => h('div', h('h2', 'Home'))
		let About = () => h('div', h('h2', 'About'))
		let Topic = () => h('div', h('h2', 'Topic'))

		render(BasicExample, container)

		let ref = container.firstChild.firstChild.firstChild
		let homeAnchor = ref.firstChild
		let aboutAnchor = ref.nextSibling.firstChild
		let topicAnchor = ref.nextSibling.nextSibling.firstChild

		homeAnchor.dispatchEvent(new Event('click'))
		assert.html(container, `
			<div>
				<ul>
					<li><a href="/">Home</a></li>
					<li><a href="/about">About</a></li>
					<li><a href="/topic">Topic</a></li>
				</ul>
				<hr>
				<div>
					<h2>Home</h2>
				</div>
			</div>
		`)

		aboutAnchor.dispatchEvent(new Event('click'))
		assert.html(container, `
			<div>
				<ul>
					<li><a href="/">Home</a></li>
					<li><a href="/about">About</a></li>
					<li><a href="/topic">Topic</a></li>
				</ul>
				<hr>
				<div>
					<h2>About</h2>
				</div>
			</div>
		`)

		topicAnchor.dispatchEvent(new Event('click'))
		assert.html(container, `
			<div>
				<ul>
					<li><a href="/">Home</a></li>
					<li><a href="/about">About</a></li>
					<li><a href="/topic">Topic</a></li>
				</ul>
				<hr>
				<div>
					<h2>Topic</h2>
				</div>
			</div>
		`)

		unmountComponentAtNode(container)
		assert.html(container, '')
		assert.include(stack, true)
		assert.lengthOf(stack, 1)

		dispatchEvent(new Event('popstate'))
		assert.lengthOf(stack, 1)
	})

	it('should read json from fetch response', (done) => {
		let container = document.createElement('div')
		let refs = null

		let fetch = (url) => {
			return new Promise((resolve) => {
				resolve({
					url: url,
					status: 200,
					statusText: '',
					ok: true,
					bodyUsed: false,
					json() {
						return new Promise((resolve) => {
							resolve({value: 'works!'})
						})
					},
					text() {
						return new Promise((resolve) => {
							resolve(JSON.stringify({value: 'works!'}))
						})
					},
					blob() {

					}
				})
			})
		}

		let Users = class {
			getInitialState() {
				return refs = fetch('https://reqres.in/api/users')
			}
			render(props, {value}) {
				return h('h1', value)
			}
		}

		render(Users, container)

		refs.then(() => {
			nextTick(() => {
				assert.html(container, '<h1>works!</h1>')
				done()
			}, 1)
		})
	})

	it('should match version with package.json', () => {
		delete require.cache[require.resolve(pkgfile)]

		assert.equal(require(pkgfile).version, version)

		delete require.cache[require.resolve(pkgfile)]
	})

	it('should handle mutable component element children', () => {
		let container = document.createElement('div')
		let stack = []
		let setRootState = null
		let setWrapperState = null

		let Child = function() {
			return h('div', 'child')
		}

		let Wrapper = function({children}, {x}) {
			setWrapperState = this.setState.bind(this)
			stack.push(x)
			return h('div', children)
		}

		let Root = function(props, {x}) {
			setRootState = this.setState.bind(this)
			stack.push(x)
			return h('div', h(Wrapper, h(Child, ['xxx'])))
		}

		render(Root, container)
		assert.html(container, `<div><div><div>child</div></div></div>`)

		setRootState({x: 'root'})
		assert.html(container, `<div><div><div>child</div></div></div>`)

		assert.doesNotThrow(() => {
			setWrapperState({x: 'wrapper'})
			assert.html(container, `<div><div><div>child</div></div></div>`)
		})
	})
})
