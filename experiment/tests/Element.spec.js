const h = element;

test('Element', ({ok, deepEqual}) => {
	let h1 = h('h1', 'Hello', 1, new Date, [2, 3], () => {}, class Foo{render(){}});
	let h2 = h('');
	let key = h('h1', {key: 1}, h('h1', {key: 2}), 'Auto Key');

	let children = h1.children;
	let props = h1.props;
	let attrs = h1.attrs;
	let tag = h1.tag;
	let flag = h1.flag;

	clone(h2, h1, 1);

	ok(tag === 'h1', 'element tag');
	ok(flag === 2, 'element flag');
	ok(props !== null && props instanceof Object, 'element props');
	ok(attrs !== null && props instanceof Object, 'element attributes');
	ok(children !== null && children instanceof Array, 'element children');
	ok(children.length === 7, 'element children length');
	ok(
		children[1].flag === 1 && children[2].flag === 1 &&
		children[5].group === 1 && children[6].group === 2,
		'element children types'
	)

	ok(key.key === 1, 'element key')
	ok(key.keyed === true, 'element keyed children');
	ok(key.children[1].key > 0, 'element auto insert keys');
	ok(h().tag === 'noscript', 'default element type');

	ok(deepEqual(h2, h1), 'element copy');
})
