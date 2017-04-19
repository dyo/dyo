import 'Boundary';

test('Event', ({ok}) => {
	// todo use jsdom/undom
	let mock = {node: {onclick: null}};

	event(mock, 'onclick', null, (e) => {
		ok(e.target === null, 'trigger event');
	});

	ok(typeof mock.node.onclick === 'function', 'assign event');
	mock.node.onclick({target: null});

	event(mock, 'onclick',
		{
			group: 2,
			owner: new (class extends Component{render () {}})
		},
		(p, s, e) => {
			ok(p.target === void 0 && e.target === null, 'trigger bound-less event')
		}
	);

	mock.node.onclick({target: null});
});
