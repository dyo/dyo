import 'Boundary';

test('Event', ({ok}) => {
	let mock = {onclick: null};
	event(mock, 'onclick', null, (e) => ok(e.target === null, 'trigger event'));

	ok(typeof mock.onclick === 'function', 'assign event');
	mock.onclick({target: null});

	event(mock, 'onclick',
		new (class extends Component{render () {}}),
		(p, s, e) => ok(p.target === void 0 && e.target === null, 'trigger bound-less event')
	);

	mock.onclick({target: null});
});
