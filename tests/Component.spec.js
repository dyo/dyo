test('Lifecycle', ({assert, done}) => {
	var container = document.createElement('div')

	class Bar {
		componentWillUpdate() { assert(true, 'componentWillUpdate#Composite') }
		componentDidUpdate() { assert(true, 'componentDidUpdate#Composite') }
		render() { return h('h1', this.props.id) }
	}

	class Foo {
		componentWillMount() { assert(true, 'componentWillMount') }
		componentDidMount() { assert(true, 'componentDidMount') }
		componentWillUpdate() { assert(true, 'componentWillUpdate') }
		componentDidUpdate() { assert(true, 'componentDidUpdate') }
		componentWillReceiveProps() { assert(true, 'componentWillReceiveProps') }
		componentWillUnmount() { assert(true, 'componentWillUnmount') }
		shouldComponentUpdate() { assert(true, 'shouldComponentUpdate') }
		render() { return Bar }
	}

	render(h(Foo, {id: 1}), container)
	render(h(Foo, {id: 1}), container)
	render(null, container)

	var stages = []
	var counter = 0

	class A {
		componentWillUnmount() {stages.push('0')}
		render(){}
	}

	class B {
		componentDidUpdate() {stages.push('5')}
		componentWillUpdate(nextProps, nextState) {stages.push('4')}
		shouldComponentUpdate() {stages.push('3')}
		componentWillReceiveProps() {stages.push('2')}
		componentWillMount() {stages.push('1')}
		render(){}
	}

	class C {
		shouldComponentUpdate({update}){
			return update
		}
		render() {
			return ++counter
		}
	}

	class X {
		componentWillUnmount() {
			stages.push('x')
		}
		render({child}) {
			return h('div', child)
		}
	}

	class Y {
		render({children}) {
			return children
		}	
	}

	render(A, container)
	render(B, container)
	render(B, container)

	assert(stages.join('') === '012345', 'Will/DidMount, ReceiveProps, shouldUpdate, Will/Didupdate, WillUnmount')

	render(h(C, {update: false}), container)
	render(h(C, {update: false}), container)
	assert(compare(container, '1'), 'shouldComponentUpdate(false)')

	render(h(C, {update: true}), container)
	assert(compare(container, '2'), 'shouldComponentUpdate(true)')

	stages = []

	render(h(Y, h(X, {child: h(X, {child: h(X, {child: h(X, {child: h(X)})})})})), container)
	assert(compare(container, '<div><div><div><div><div></div></div></div></div></div>'), 'componentDidMount#deep')
	
	render(h(Y, h(X)), container)
	assert(compare(container, '<div></div>') && stages.join(',') === 'x,x,x,x', 'componentWillUnmount#deep')

	done()
})

test('Constructor', ({assert, done}) => {
	var container = document.createElement('div')

	class A extends Component {
		constructor() {super()}
		render() {return h('h1', this.props.value)}
	}

	class B extends Component {
		constructor(props) {super(props)}
		render() {return h('h1', this.props.value)}
	}

	render(h(A, {value: 'Hello'}), container)
	assert(compare(container, '<h1>Hello</h1>'), 'super(props)')

	render(h(B, {value: 'Hello'}), container)
	assert(compare(container, '<h1>Hello</h1>'), 'super()')

	done()
})

test('Error Boundaries', ({assert, done}) => {
	var container = document.createElement('div')

	class A {
		componentDidCatch(error) {
			error.report = assert(true, 'componentDidCatch')
			return error.message
		}
		render() {
			throw 'render'
		}
	}

	render(A, container)
	assert(compare(container, 'render'), 'componentDidCatch#render')

	done()
})

test('PureComponent', ({assert, done}) => {
	var container = document.createElement('div')
	var counter = 0

	class A extends PureComponent {
		render () {
			return h('div', counter++)
		}
	}

	render(h(A, {id: 1}), container)
	render(h(A, {id: 1}), container)
	assert(compare(container, '<div>0</div>'), 'shouldComponentUpdate(false)')
	render(h(A, {id: 2}), container)
	assert(compare(container, '<div>1</div>'), 'shouldComponentUpdate(true)')
	done()
})

test('setState', ({assert, done}) => {		
	var stack = []
	var forceUpdateChild = null;
	
	Child = function(props) {
	  forceUpdateChild = this.forceUpdate.bind(this);
	  return h('div', props.x);
	};

	setState = null;
	Root = function() {
	  setState = this.setState.bind(this);
	  return h('div', h(Child, {
	    x: this.state.locale['xxx']
	  }));
	};
	Root.getInitialState = function() {return {locale: {}}}

	container = document.createElement('div');
	render(h(Root), container);
	stack.push(container.innerHTML)
	setState({
	  locale: {
	    'xxx': 'abc'
	  }
	});
	stack.push(container.innerHTML)
	forceUpdateChild();
	stack.push(container.innerHTML)

	assert(
		stack.join('') === '<div><div></div></div><div><div>abc</div></div><div><div>abc</div></div>',
		'maintain props on state update'
	)

	class A {
		componentDidMount() {
			return {x: 'value'}
		}
		componentDidUpdate() {
			assert(compare(container, '<div>value</div>'), 'implicit setState from lifecycle')
			done()
		}
		render () {
			return h('div', this.state.x)
		}
	}

	render(h(A), container)
})
