module.exports = ({h, render}) => {
	test('Reconcile', ({ok, end}) => {
		class List {
			render () {
				return h('ul',
					this.props.data.map(v => h('li', {key: v}, v))
				)
			}
		}

		var container = document.createElement('div')

		render(h(List, {data: [1, 2]}), container)
		render(h(List, {data: [2, 1]}), container)

		ok(compare(container, `
			<ul>
				<li>2</li>
				<li>1</li>
			</ul>
		`), '[simple]  - 1, 2 -> 2, 1')

		render(h(List, {data: [1, 2, 3]}), container)
		render(h(List, {data: [3, 2, 1]}), container)
		ok(compare(container, `
			<ul>
				<li>3</li>
				<li>2</li>
				<li>1</li>
			</ul>
		`), '[simple]  - 1, 2, 3 -> 3, 2, 1')

		render(h(List, {data: [1, 2, 3, 4, 5, 6]}), container)
		render(h(List, {data: [6, 2, 3, 4, 5, 1]}), container)
		ok(compare(container, `
			<ul>
				<li>6</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>1</li>
			</ul>
		`), '[simple]  - 1, 2, 3, 4, 5, 6 -> 6, 2, 3, 4, 5, 1')

		render(h(List, {data: ['a', 'b', 'c', 'd', 'e', 'q', 'f', 'g']}), container)
		render(h(List, {data: ['a', 'b', 'f', 'd', 'c', 'g']}), container)
		ok(compare(container, `
			<ul>
				<li>a</li>
				<li>b</li>
				<li>f</li>
				<li>d</li>
				<li>c</li>
				<li>g</li>
			</ul>
		`), '[simple]  - a, b, c, d, e, q, f, g -> a, b, f, d, c, g')

		render(h(List, {data: ['w', 'g', 'c', 'f', 'd', 'b', 'a', 'z']}), container)
		render(h(List, {data: ['w', 'a', 'b', 'f', 'd', 'c', 'g', 'z']}), container)
		ok(compare(container, `
			<ul>
				<li>w</li>
				<li>a</li>
				<li>b</li>
				<li>f</li>
				<li>d</li>
				<li>c</li>
				<li>g</li>
				<li>z</li>
			</ul>
		`), '[simple]  - w, g, c, f, d, b, a, z -> w, a, b, f, d, c, g, z')

		render(h(List, {data: [1, 2, 3, 4, 5]}), container)
		render(h(List, {data: [6, 7, 8, 9, 10, 11]}), container)
		ok(compare(container, `
			<ul>
				<li>6</li>
				<li>7</li>
				<li>8</li>
				<li>9</li>
				<li>10</li>
				<li>11</li>
			</ul>
		`), '[simple]  - 1, 2, 3, 4, 5 -> 6, 7, 8, 9, 10, 11')

		render(h(List, {data: [1, 5]}), container)
		render(h(List, {data: [1, 2, 3, 4, 5]}), container)
		ok(compare(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
			</ul>
		`), '[simple]  - 1, 5 -> 1, 2, 3, 4, 5')

		render(h(List, {data: [1, 2, 5, 6, 7]}), container)
		render(h(List, {data: [1, 2, 3, 4, 5, 6]}), container)
		ok(compare(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`), '[simple]  - 1, 2, 5, 6, 7 -> 1, 2, 3, 4, 5, 6')

		render(h(List, {data: [1, 2, 3, 4, 5, 6]}), container)
		render(h(List, {data: [1, 2, 4, 5, 6]}), container)
		ok(compare(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`), '[simple] - 1, 2, 3, 4, 5, 6 -> 1, 2, 4, 5, 6')

		render(h(List, {data: [1, 2, 3, 4, 5, 6]}), container);
		render(h(List, {data: [1, 40, 0, 3, 4, 2, 5, 6, 60]}), container);
		ok(compare(container, `
			<ul>
				<li>1</li>
				<li>40</li>
				<li>0</li>
				<li>3</li>
				<li>4</li>
				<li>2</li>
				<li>5</li>
				<li>6</li>
				<li>60</li>
			</ul>
		`), '[complex] - 1, 2, 3, 4, 5, 6 -> 1, 40, 0, 3, 4, 2, 5, 6, 60')

		render(h(List, {data: [1, 40, 0, 3, 4, 2, 5, 6, 60]}), container);
		render(h(List, {data: [1, 2, 3, 0, 5, 6, 90, 4]}), container);
		ok(compare(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>0</li>
				<li>5</li>
				<li>6</li>
				<li>90</li>
				<li>4</li>
			</ul>
		`), '[complex] - 1, 40, 0, 3, 4, 2, 5, 6, 60 -> 1, 2, 3, 0, 5, 6, 90, 4');

		render(h(List, {data: [0, 2, 4, 6, 8]}), container);
		render(h(List, {data: [0, 1, 2, 3, 4, 5, 6, 7, 8]}), container);
		ok(compare(container, `
			<ul>
				<li>0</li>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
				<li>7</li>
				<li>8</li>
			</ul>
		`), '[complex] - 0, 2, 4, 6, 8 -> 0, 1, 2, 3, 4, 5, 6, 7, 8');

		render(h(List, {data: [1, 40, 0, 3, 4, 2, 5, 6, 60]}), container);
		render(h(List, {data: [1, 2, 3, 4, 5, 6]}), container);
		ok(compare(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`), '[complex] - 1, 40, 0, 3, 4, 2, 5, 6, 60 -> 1, 2, 3, 4, 5, 6');

		render(h(List, {data: ['a', 'b', 'd', 'f', 'c']}), container);
		render(h(List, {data: ['c', 'b', 'd', 'r', 'a']}), container);

		ok(compare(container, `
			<ul>
				<li>c</li>
				<li>b</li>
				<li>d</li>
				<li>r</li>
				<li>a</li>
			</ul>
		`), '[complex] - a, b, d, f, c -> c, b, d, r, a');

		end()
	})
}
