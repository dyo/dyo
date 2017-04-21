import 'Boundary';

test('Event', ({ok}) => {
	// todo use jsdom/undom
	let mock = {node: {onclick: null}};

	event(mock, 'onclick', (e) => {
		ok(e.target === null, 'trigger event');
	}, null);

	ok(typeof mock.node.onclick === 'function', 'assign event');
	mock.node.onclick({target: null});

	event(mock, 'onclick',
		(p, s, e) => {
			ok(p.target === void 0 && e.target === null, 'trigger bound-less event')
		},
		{
			group: 2,
			owner: new (class extends Component{render () {}})
		}
	);

	mock.node.onclick({target: null});
});
