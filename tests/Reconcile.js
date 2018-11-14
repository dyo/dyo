import {h, Component, Fragment, render} from 'dyo'

describe('Reconcile', () => {
	const target = document.createElement('div')

	class Target extends Component {
		render ({children}) { return children.map(v => h(Fragment, {key: v}, v)) }
	}

	it('simple [1] - [1, 2, 3, 4]', () => {
		render(h(Target, [1]), target, (current) => assert.html(current,  '1'))
		render(h(Target, [1, 2, 3, 4]), target, (current) => assert.html(current,  '1234'))
	})

	it('simple [] - [1, 2, 3, 4]', () => {
		render(h(Target, []), target, (current) => assert.html(current,  ''))
		render(h(Target, [1, 2, 3, 4]), target, (current) => assert.html(current,  '1234'))
	})

	it('simple [1] - [4, 3, 2, 1]', () => {
		render(h(Target, [1]), target, (current) => assert.html(current,  '1'))
		render(h(Target, [4, 3, 2, 1]), target, (current) => assert.html(current,  '4321'))
	})

	it('simple [1, 5] - [1, 2, 3, 4, 5]', () => {
		render(h(Target, [1, 5]), target, (current) => assert.html(current,  '15'))
		render(h(Target, [1, 2, 3, 4, 5]), target, (current) => assert.html(current,  '12345'))
	})

	it('simple [1, 2, 5, 6, 7] - [1, 2, 3, 4, 5, 6]', () => {
		render(h(Target, [1, 2, 5, 6, 7]), target, (current) => assert.html(current,  '12567'))
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '123456'))
	})

	it('replace [3, 2, 4, 1] - [4, 1, 3, 2]', () => {
		render(h(Fragment, h('li', {key: 3}, 3), h('li', {key: 2}, 2), h('li', {key: 4}, 4), h('li', {key: 1}, 1)), target, (current) => {
			assert.html(current, '<li>3</li><li>2</li><li>4</li><li>1</li>')
		})
		render(h(Fragment, h('li', {key: 4}, -4), h('li', {key: 1}, -1), h('li', {key: 3}, -3), h('li', {key: 2}, -2)), target, (current) => {
			assert.html(current, '<li>-4</li><li>-1</li><li>-3</li><li>-2</li>')
		})
	})

	it('replace [1, 2, 3, 4, 5] - [6, 7, 8, 9, 10, 11]', () => {
		render(h(Target, [1, 2, 3, 4, 5]), target, (current) => assert.html(current,  '12345'))
		render(h(Target, [6, 7, 8, 9, 10, 11]), target, (current) => assert.html(current,  '67891011'))
	})

	it('replace [1, 2, 3, 4, 5] - [6, 7, 8, 9, 10]', () => {
		render(h(Target, [1, 2, 3, 4, 5]), target, (current) => assert.html(current,  '12345'))
		render(h(Target, [6, 7, 8, 9, 10]), target, (current) => assert.html(current,  '678910'))
	})

	it('reverse [1, 2] - [2, 1]', () => {
		render(h(Target, [1, 2]), target, (current) => assert.html(current,  '12'))
		render(h(Target, [2, 1]), target, (current) => assert.html(current,  '21'))
	})

	it('reverse [1, 2, 3] - [3, 2, 1]', () => {
		render(h(Target, [1, 2, 3]), target, (current) => assert.html(current,  '123'))
		render(h(Target, [3, 2, 1]), target, (current) => assert.html(current,  '321'))
	})

	it('reverse [1, 2, 3, 4, 5, 6] - [6, 2, 3, 4, 5, 1]', () => {
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '123456'))
		render(h(Target, [6, 2, 3, 4, 5, 1]), target, (current) => assert.html(current,  '623451'))
	})

	it('complex [1, 2, 3, 4, 5, 6] - [1, 2, 4, 5, 6]', () => {
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '123456'))
		render(h(Target, [1, 2, 4, 5, 6]), target, (current) => assert.html(current,  '12456'))
	})

	it('complex [a, b, c, d, e, q, f, g] - [a, b, f, d, c, g]', () => {
		render(h(Target, ['a', 'b', 'c', 'd', 'e', 'q', 'f', 'g']), target, (current) => assert.html(current,  'abcdeqfg'))
		render(h(Target, ['a', 'b', 'f', 'd', 'c', 'g']), target, (current) => assert.html(current,  'abfdcg'))
	})

	it('complex [w, g, c, f, d, b, a, z] - [w, a, b, f, d, c, g, z]', () => {
		render(h(Target, ['w', 'g', 'c', 'f', 'd', 'b', 'a', 'z']), target, (current) => assert.html(current,  'wgcfdbaz'))
		render(h(Target, ['w', 'a', 'b', 'f', 'd', 'c', 'g', 'z']), target, (current) => assert.html(current,  'wabfdcgz'))
	})

	it('complex [1, 2, 3, 4, 5, 6] - [1, 40, 0, 3, 4, 2, 5, 6, 60]', () => {
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '123456'))
		render(h(Target, [1, 40, 0, 3, 4, 2, 5, 6, 60]), target, (current) => assert.html(current,  '14003425660'))
	})

	it('complex [1, 40, 0, 3, 4, 2, 5, 6, 60] - [1, 2, 3, 0, 5, 6, 90, 4]', () => {
		render(h(Target, [1, 40, 0, 3, 4, 2, 5, 6, 60]), target, (current) => assert.html(current,  '14003425660'))
		render(h(Target, [1, 2, 3, 0, 5, 6, 90, 4]), target, (current) => assert.html(current,  '123056904'))
	})

	it('complex [0, 2, 4, 6, 8] - [0, 1, 2, 3, 4, 5, 6, 7, 8]', () => {
		render(h(Target, [0, 2, 4, 6, 8]), target, (current) => assert.html(current,  '02468'))
		render(h(Target, [0, 1, 2, 3, 4, 5, 6, 7, 8]), target, (current) => assert.html(current,  '012345678'))
	})

	it('complex [1, 40, 0, 3, 4, 2, 5, 6, 60] - [1, 2, 3, 4, 5, 6]', () => {
		render(h(Target, [1, 40, 0, 3, 4, 2, 5, 6, 60]), target, (current) => assert.html(current,  '14003425660'))
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '123456'))
	})

	it('complex [a, b, d, f, c] - [c, b, d, r, a]', () => {
		render(h(Target, ['a', 'b', 'd', 'f', 'c']), target, (current) => assert.html(current,  'abdfc'))
		render(h(Target, ['c', 'b', 'd', 'r', 'a']), target, (current) => assert.html(current,  'cbdra'))
	})

	it('complex [1, 2, 3, 4, 5, 6] - [6, 3, 2, 5, 4, 1]', () => {
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '123456'))
		render(h(Target, [6, 3, 2, 5, 4, 1]), target, (current) => assert.html(current,  '632541'))
	})

	it('complex [7, 6, 5, 4, 3, 2] - [6, 5, 4, 3, 2, 1]', () => {
		render(h(Target, [7, 6, 5, 4, 3, 2]), target, (current) => assert.html(current,  '765432'))
		render(h(Target, [6, 5, 4, 3, 2, 1]), target, (current) => assert.html(current,  '654321'))
	})

	it('complex [6, 5, 4, 3, 2, 1] - [7, 6, 5, 4, 3, 2]', () => {
		render(h(Target, [6, 5, 4, 3, 2, 1]), target, (current) => assert.html(current,  '654321'))
		render(h(Target, [7, 6, 5, 4, 3, 2]), target, (current) => assert.html(current,  '765432'))
	})

	it('complex [1, 2, 3, 4, 5, 6] - [2, 3, 4, 5, 6, 1]', () => {
		render(h(Target, [6, 5, 4, 3, 2, 1]), target, (current) => assert.html(current,  '654321'))
		render(h(Target, [2, 3, 4, 5, 6, 1]), target, (current) => assert.html(current,  '234561'))
	})

	it('complex [2, 3, 4, 5, 6, 1] - [2, 3, 4, 5, 6, 1]', () => {
		render(h(Target, [2, 3, 4, 5, 6, 1]), target, (current) => assert.html(current,  '234561'))
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '123456'))
	})

	it('complex [0, 2, 3, 4, 5, 6, 1] - [0, 1, 2, 3, 4, 5, 6]', () => {
		render(h(Target, [0, 2, 3, 4, 5, 6, 1]), target, (current) => assert.html(current,  '0234561'))
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '0123456'))
	})

	it('complex [0, 2, 3, 4, 5, 6, 1, 7] - [0, 1, 2, 3, 4, 5, 6]', () => {
		render(h(Target, [0, 2, 3, 4, 5, 6, 1, 7]), target, (current) => assert.html(current,  '02345617'))
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '0123456'))
	})

	it('complex [2, 3, 4, 5, 6, 1, 0] - [1, 2, 3, 4, 5, 6]', () => {
		render(h(Target, [2, 3, 4, 5, 6, 1, 0]), target, (current) => assert.html(current,  '2345610'))
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '123456'))
	})

	it('complex [0, 2, 3, 4, 5, 6, 1, 7] - [0, 7, 2, 3, 4, 1, 6]', () => {
		render(h(Target, [0, 2, 3, 4, 5, 6, 1, 7]), target, (current) => assert.html(current,  '02345617'))
		render(h(Target, [0, 7, 2, 3, 4, 1, 6]), target, (current) => assert.html(current,  '0723416'))
	})

	it('complex [0, 2, 3, 4, 5, 6, 1, 7] - [0, 5, 2, 3, 4, 1, 6]', () => {
		render(h(Target, [0, 2, 3, 4, 5, 6, 1, 7]), target, (current) => assert.html(current,  '02345617'))
		render(h(Target, [0, 5, 2, 3, 4, 1, 6]), target, (current) => assert.html(current,  '0523416'))
	})

	it('shuffle [2, 7, 8, 3, 4, 6, 9, 5, 0, 1] - [0, 4, 6, 9, 5, 2, 8, 7, 3, 1]', () => {
		render(h(Target, [2, 7, 8, 3, 4, 6, 9, 5, 0, 1]), target, (current) => assert.html(current,  '2783469501'))
		render(h(Target, [0, 4, 6, 9, 5, 2, 8, 7, 3, 1]), target, (current) => assert.html(current,  '0469528731'))
	})

	it('shuffle [5, 7, 2, 1, 9, 6, 8, 0, 3, 4] - [8, 0, 3, 9, 4, 5, 7, 2, 6, 1]', () => {
		render(h(Target, [5, 7, 2, 1, 9, 6, 8, 0, 3, 4]), target, (current) => assert.html(current,  '5721968034'))
		render(h(Target, [8, 0, 3, 9, 4, 5, 7, 2, 6, 1]), target, (current) => assert.html(current,  '8039457261'))
	})

	it('shuffle [5, 6, 7, 0, 1, 2, 9, 3, 8, 4] - [1, 0, 3, 8, 2, 4, 5, 7, 6, 9]', () => {
		render(h(Target, [5, 6, 7, 0, 1, 2, 9, 3, 8, 4]), target, (current) => assert.html(current,  '5670129384'))
		render(h(Target, [1, 0, 3, 8, 2, 4, 5, 7, 6, 9]), target, (current) => assert.html(current,  '1038245769'))
	})

	it('shuffle [4, 3, 1, 5, 6, 7, 8, 0, 2, 9] - [4, 1, 3, 7, 0, 9, 8, 2, 5, 6]', () => {
		render(h(Target, [4, 3, 1, 5, 6, 7, 8, 0, 2, 9]), target, (current) => assert.html(current,  '4315678029'))
		render(h(Target, [4, 1, 3, 7, 0, 9, 8, 2, 5, 6]), target, (current) => assert.html(current,  '4137098256'))
	})

	it('shuffle [8, 1, 0, 6, 5, 4, 3, 7, 9, 2] - [4, 3, 1, 5, 6, 7, 8, 0, 2, 9]', () => {
		render(h(Target, [8, 1, 0, 6, 5, 4, 3, 7, 9, 2]), target, (current) => assert.html(current,  '8106543792'))
		render(h(Target, [4, 3, 1, 5, 6, 7, 8, 0, 2, 9]), target, (current) => assert.html(current,  '4315678029'))
	})

	it('react-worst-case [0, 1, 2, 3, 4, 5, 6] - [5, 1, 2, 3, 4]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '0123456'))
		render(h(Target, [5, 1, 2, 3, 4]), target, (current) => assert.html(current,  '51234'))
	})

	it('snabbdom-worst-case [0, 1, 2, 3, 4, 5, 6] - [1, 2, 3, 4, 6, 0, 5]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '0123456'))
		render(h(Target, [5, 1, 2, 3, 4]), target, (current) => assert.html(current,  '51234'))
	})

	it('ivi-worst-case [0, 1, 2, 3, 4, 5, 6] - [5, 4, 3, 2, 1]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '0123456'))
		render(h(Target, [5, 4, 3, 2, 1]), target, (current) => assert.html(current,  '54321'))
	})

	it('virtual-dom-worst-case [0, 1, 2, 3, 4, 5, 6] - [2, 3, 4, 5, 6, 0, 1]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '0123456'))
		render(h(Target, [2, 3, 4, 5, 6, 0, 1]), target, (current) => assert.html(current,  '2345601'))
	})

	it('other [1] - [2]', () => {
		render(h(Target, [1]), target, (current) => assert.html(current,  '1'))
		render(h(Target, [2]), target, (current) => assert.html(current,  '2'))
	})

	it('other [1, 2, 3] - [1 3, 4]', () => {
		render(h(Target, [1, 2, 3]), target, (current) => assert.html(current,  '123'))
		render(h(Target, [1, 3, 4]), target, (current) => assert.html(current,  '134'))
	})

	it('other [1, 2] - [1, 3, 4]', () => {
		render(h(Target, [1, 2]), target, (current) => assert.html(current,  '12'))
		render(h(Target, [1, 3, 4]), target, (current) => assert.html(current,  '134'))
	})

	it('other [1, 2, 3, 4, 5] - [6, 7, 8, 9, 10]', () => {
		render(h(Target, [1, 2, 3, 4, 5]), target, (current) => assert.html(current,  '12345'))
		render(h(Target, [6, 7, 8, 9, 10]), target, (current) => assert.html(current,  '678910'))
	})

	it('other [4, 3, 2, 1] - [1, 2, 3, 4, 5]', () => {
		render(h(Target, [4, 3, 2, 1]), target, (current) => assert.html(current,  '4321'))
		render(h(Target, [1, 2, 3, 4, 5]), target, (current) => assert.html(current,  '12345'))
	})

	it('other [1, 2, 3, 4, 5] - [1, 2, 5, 6, 7]', () => {
		render(h(Target, [1, 2, 3, 4, 5]), target, (current) => assert.html(current,  '12345'))
		render(h(Target, [1, 2, 5, 6, 7]), target, (current) => assert.html(current,  '12567'))
	})

	it('other [1, 2, 5, 6, 7] - [4, 3, 2, 1]', () => {
		render(h(Target, [1, 2, 5, 6, 7]), target, (current) => assert.html(current,  '12567'))
		render(h(Target, [4, 3, 2, 1]), target, (current) => assert.html(current,  '4321'))
	})

	it('other [1, 2, 5, 6, 7] - [4, 3, 2, 1, 0]', () => {
		render(h(Target, [1, 2, 5, 6, 7]), target, (current) => assert.html(current,  '12567'))
		render(h(Target, [4, 3, 2, 1, 0]), target, (current) => assert.html(current,  '43210'))
	})

	it('other [1, 2, 5, 6, 7]', () => {
		render(h(Target, [1, 2, 5, 6, 7]), target, (current) => assert.html(current,  '12567'))
		render(h(Target, [4, 3, 2, 1, 5]), target, (current) => assert.html(current,  '43215'))
	})

	it('other [2, 1] - [4, 3, 1, 2]', () => {
		render(h(Target, [2, 1]), target, (current) => assert.html(current,  '21'))
		render(h(Target, [4, 3, 1, 2]), target, (current) => assert.html(current,  '4312'))
	})

	it('other [1, 5] - [4, 3, 1, 2]', () => {
		render(h(Target, [1, 5]), target, (current) => assert.html(current,  '15'))
		render(h(Target, [4, 3, 2, 1]), target, (current) => assert.html(current,  '4321'))
	})

	it('other [4, 3, 2, 1] - [1, 5]', () => {
		render(h(Target, [4, 3, 2, 1]), target, (current) => assert.html(current,  '4321'))
		render(h(Target, [1, 5]), target, (current) => assert.html(current,  '15'))
	})

	it('other [0, 1, 2, 3, 4, 5, 6] - [7, 1, 2, 3, 4, 6, 0, 5]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current,  '0123456'))
		render(h(Target, [7, 1, 2, 3, 4, 6, 0, 5]), target, (current) => assert.html(current,  '71234605'))
	})

	it('other [0, 1, 2, 3, 4, 5] - [7, 1, 2, 3, 4, 6, 0, 5]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 5]), target, (current) => assert.html(current, '012345'))
		render(h(Target, [7, 1, 2, 3, 4, 6, 0, 5]), target, (current) => assert.html(current, '71234605'))
	})

	it('other [0, 1, 2, 3, 4, 5, 6] - [5, 1, 2, 3, 4, 0]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current, '0123456'))
		render(h(Target, [5, 1, 2, 3, 4, 0]), target, (current) => assert.html(current, '512340'))
	})

	it('other [1, 2, 0, 3, 4, 5, 6] - [5, 1, 2, 3, 4, 0]', () => {
		render(h(Target, [1, 2, 0, 3, 4, 5, 6]), target, (current) => assert.html(current, '1203456'))
		render(h(Target, [5, 1, 2, 3, 4, 0]), target, (current) => assert.html(current, '512340'))
	})

	it('other [0, 1, 2, 3, 4, 5, 6] - [5, 1, 2, 3, 0, 4]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current, '0123456'))
		render(h(Target, [5, 1, 2, 3, 0, 4]), target, (current) => assert.html(current, '512304'))
	})

	it('other [0, 1, 2, 3, 4, 6, 5] - [5, 1, 2, 3, 0, 4, 7, 6]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 6, 5]), target, (current) => assert.html(current, '0123465'))
		render(h(Target, [5, 1, 2, 3, 0, 4, 7, 6]), target, (current) => assert.html(current, '51230476'))
	})

	it('other [0, 1, 2, 3, 4, 5, 6] - [1, 2, 5, 3, 4, 0]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current, '0123456'))
		render(h(Target, [1, 2, 5, 3, 4, 0]), target, (current) => assert.html(current, '125340'))
	})

	it('other [0, 1, 2, 3, 4, 5, 6] - [5, 4, 3, 2, 1]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current, '0123456'))
		render(h(Target, [5, 4, 3, 2, 1]), target, (current) => assert.html(current, '54321'))
	})

	it('other [2, 3, 4, 5, 6, 0, 1] - [0, 1, 2, 3, 4, 5, 6]', () => {
		render(h(Target, [2, 3, 4, 5, 6, 0, 1]), target, (current) => assert.html(current, '2345601'))
		render(h(Target, [0, 1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current, '0123456'))
	})

	it('other [1, 2, 3, 4, 5, 0] - [0, 1, 2, 3, 4, 5]', () => {
		render(h(Target, [1, 2, 3, 4, 5, 0]), target, (current) => assert.html(current, '123450'))
		render(h(Target, [0, 1, 2, 3, 4, 5]), target, (current) => assert.html(current, '012345'))
	})

	it('other [0, 1, 2, 3, 4, 5] - [1, 2, 3, 4, 5, 0]', () => {
		render(h(Target, [0, 1, 2, 3, 4, 5]), target, (current) => assert.html(current, '012345'))
		render(h(Target, [1, 2, 3, 4, 5, 0]), target, (current) => assert.html(current, '123450'))
	})

	it('other [1, 5, 6] - [1, 2, 3, 4, 5, 6]', () => {
		render(h(Target, [1, 5, 6]), target, (current) => assert.html(current, '156'))
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current, '123456'))
	})

	it('other [a, b, 1, 2, 3] - [1, 2, 3, b, a]', () => {
		render(h(Target, ['a', 'b', 1, 2, 3]), target, (current) => assert.html(current, 'ab123'))
		render(h(Target, [1, 2, 3, 'b', 'a']), target, (current) => assert.html(current, '123ba'))
	})

	it('other [1, 2, 3, b, a] - [a, b, 1, 2, 3]', () => {
		render(h(Target, [1, 2, 3, 'b', 'a']), target, (current) => assert.html(current, '123ba'))
		render(h(Target, ['a', 'b', 1, 2, 3]), target, (current) => assert.html(current, 'ab123'))
	})

	it('other [1, 2, 3, b, a] - [a, b, 4, 5, 6, 1, 2, 3]', () => {
		render(h(Target, [1, 2, 3, 'b', 'a']), target, (current) => assert.html(current, '123ba'))
		render(h(Target, ['a', 'b', 4, 5, 6, 1, 2, 3]), target, (current) => assert.html(current, 'ab456123'))
	})

	it('other [1, 2, 3, 4, 5, 6, b, a] - [a, b, 1, 2, 3]', () => {
		render(h(Target, [1, 2, 3, 4, 5, 6, 'b', 'a']), target, (current) => assert.html(current, '123456ba'))
		render(h(Target, ['a', 'b', 1, 2, 3]), target, (current) => assert.html(current, 'ab123'))
	})

	it('other [1, 2, 6] - [1, 2, 3, 4, 5, 6]', () => {
		render(h(Target, [1, 2, 6]), target, (current) => assert.html(current, '126'))
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current, '123456'))
	})

	it('other [1, 2] - [1, 2, 3, 4, 5, 6]', () => {
		render(h(Target, [1, 2]), target, (current) => assert.html(current, '12'))
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current, '123456'))
	})

	it('other [1, 2, 3, 4, 5, 6] - [1, 2]', () => {
		render(h(Target, [1, 2, 3, 4, 5, 6]), target, (current) => assert.html(current, '123456'))
		render(h(Target, [1, 2]), target, (current) => assert.html(current, '12'))
	})

	it('fuzz(10) shuffle(20) - shuffle(20)', () => {
		Array.from({length: 10}, (v, i) => assert.rand(Array.from({length: 20}, (v, i) => i))).forEach((v, i) => {
			render(h('ul', v.map(v => h('li', {key: v}, v))), target, (current) => {
				assert.html(current, `<ul>${v.map(v => `<li>${v}</li>`).join('')}</ul>`)
			})
		})
	})

	it('fuzz(10) shuffle(40) - shuffle(40)', () => {
		Array.from({length: 10}, (v, i) => assert.rand(Array.from({length: 40}, (v, i) => i))).forEach((v, i) => {
			render(h('ul', v.map(v => h('li', {key: v}, v))), target, (current) => {
				assert.html(current, `<ul>${v.map(v => `<li>${v}</li>`).join('')}</ul>`)
			})
		})
	})

	it('fuzz(10) shuffle(60) - shuffle(60)', () => {
		Array.from({length: 10}, (v, i) => assert.rand(Array.from({length: 60}, (v, i) => i))).forEach((v, i) => {
			render(h('ul', v.map(v => h('li', {key: v}, v))), target, (current) => {
				assert.html(current, `<ul>${v.map(v => `<li>${v}</li>`).join('')}</ul>`)
			})
		})
	})

	it('fuzz(10) shuffle(80) - shuffle(80)', () => {
		Array.from({length: 10}, (v, i) => assert.rand(Array.from({length: 80}, (v, i) => i))).forEach((v, i) => {
			render(h('ul', v.map(v => h('li', {key: v}, v))), target, (current) => {
				assert.html(current, `<ul>${v.map(v => `<li>${v}</li>`).join('')}</ul>`)
			})
		})
	})

	it('fuzz(10) shuffle(100) - shuffle(100)', () => {
		Array.from({length: 10}, (v, i) => assert.rand(Array.from({length: 100}, (v, i) => i))).forEach((v, i) => {
			render(h('ul', v.map(v => h('li', {key: v}, v))), target, (current) => {
				assert.html(current, `<ul>${v.map(v => `<li>${v}</li>`).join('')}</ul>`)
			})
		})
	})
})
