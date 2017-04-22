module.exports = ({h, render}) => {
	test('Lifecycle', ({ok, end}) => {
		var container = document.createElement('div');

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
				return h('h1', 1);
			}
		}

		render(h(Foo, {id: 1}), container);
		render(h(Foo, {id: 1}), container);
		render(null, container);
		end();
	});
}
