module.exports = ({h, render, Component}) => {
	test('Lifecycle', ({ok, end}) => {
		var container = document.createElement('div');

		class Bar {
			componentWillUpdate() {
				ok(true, 'componentWillUpdate - composite');
			}
			componentDidUpdate() {
				ok(true, 'componentDidUpdate - composite');
			}
			render() {
				return h('h1', this.props.id);
			}
		}

		class Foo {
			componentWillMount() {
				ok(true, 'componentWillMount');
			}
			componentDidMount() {
				ok(true, 'componentDidMount');
			}
			componentWillUpdate() {
				ok(true, 'componentWillUpdate');
			}
			componentDidUpdate() {
				ok(true, 'componentDidUpdate');
			}
			componentWillReceiveProps() {
				ok(true, 'componentWillReceiveProps');
			}
			componentWillUnmount() {
				ok(true, 'componentWillUnmount');
			}
			shouldComponentUpdate() {
				ok(true, 'shouldComponentUpdate');
			}
			render() {
				return Bar;
			}
		}

		var mounts = [];

		class A {
			componentWillUnmount() {
				mounts.push('2')
			}
			render() {

			}
		}

		class B {
			componentWillUpdate(nextProps, nextState) {
				this.setState({id: nextState.id+1});
			}
			componentWillReceiveProps() {
				this.setState({id: 2});
			}
			componentDidUpdate() {
				mounts.push(this.state.id.toString());
			}
			componentWillMount() {
				mounts.push('1')
			}
			render() {

			}
		}

		render(h(Foo, {id: 1}), container);
		render(h(Foo, {id: 1}), container);
		render(null, container);

		render(A, container);
		render(B, container);
		render(B, container);

		ok(mounts.join('') === '123', 'setState')

		end();
	});

	test('Props', ({ok, end}) => {
		var container = document.createElement('div');

		class A extends Component {
			constructor() {
				super()
			}
			render() {
				return h('h1', this.props.value)
			}
		}

		class B extends Component {
			constructor(props) {
				super(props)
			}
			render() {
				return h('h1', this.props.value)
			}
		}

		render(h(A, {value: 'Hello'}), container)
		ok(container.innerHTML === '<h1>Hello</h1>', 'pass props without super(props)')

		render(h(B, {value: 'Hello'}), container)
		ok(container.innerHTML === '<h1>Hello</h1>', 'pass props with super(props)')

		end();
	});
}
