module.exports = ({h, isValidElement, cloneElement}) => {
	test('Element', ({ok, end, equals}) => {
		ok(isValidElement(h('div')), '#isValidElement(element)')
		ok(cloneElement(h('h1', {className: 'head'})).props.className === 'head', '#cloneElement(element)')
		ok(h('h1', 'Hello World').type === 'h1', '#createElement(tag)')
		ok(h('h1', {key: 'bar'}).key === 'bar', '#createElement(..., {key: ...})')
		ok(h('h1', {ref: 'bar'}).ref === 'bar', '#createElement(..., {ref: ...})')
		ok(h('h1', {xmlns: 'bar'}).xmlns === 'bar', '#createElement(..., {xmlns: ...})')
		ok(h('div', [1, 2], 3, h('h1')).children.length===4, '#createElement(..., children)')
		ok(h('div', h('h1', {key: 1})).keyed, '#createElement(..., keyed children)')
		end()
	})
}
