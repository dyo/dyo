module.exports = ({h, render}) => {
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

		render(h(Foo, {id: 1}), container);
		render(h(Foo, {id: 1}), container);
		render(null, container);
		end();
	});
}
