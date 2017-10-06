describe('Reconcile', () => {
	let container = document.createElement('div')
	let List = class {
		render ({type}) {
			return h('ul',
				this.props.data.map(v => h(type, {key: v}, v))
			)
		}
	}

	it('[simple] - 1 -> 1, 2, 3, 4', () => {
		render(h(List, {type: 'li', data: [1]}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 4]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
			</ul>
		`)
	})

	it('[simple] - | -> 1, 2, 3, 4', () => {
		render(h(List, {type: 'li', data: []}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 4]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
			</ul>
		`)
	})

	it('[simple] - 1 -> 4, 3, 2, 1', () => {
		render(h(List, {type: 'li', data: [1]}), container)
		render(h(List, {type: 'li', data: [4, 3, 2, 1]}), container)

		assert.html(container, `
			<ul>
				<li>4</li>
				<li>3</li>
				<li>2</li>
				<li>1</li>
			</ul>
		`)
	})

	it('[simple] - 1, 2 -> 2, 1', () => {
		render(h(List, {type: 'li', data: [1, 2]}), container)
		render(h(List, {type: 'li', data: [2, 1]}), container)

		assert.html(container, `
			<ul>
				<li>2</li>
				<li>1</li>
			</ul>
		`)
	})

	it('[simple] - 1, 2, 3 -> 3, 2, 1', () => {
		render(h(List, {type: 'li', data: [1, 2, 3]}), container)
		render(h(List, {type: 'li', data: [3, 2, 1]}), container)

		assert.html(container, `
			<ul>
				<li>3</li>
				<li>2</li>
				<li>1</li>
			</ul>
		`)
	})

	it('[simple] - 1, 2, 3, 4, 5, 6 -> 6, 2, 3, 4, 5, 1', () => {
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)
		render(h(List, {type: 'li', data: [6, 2, 3, 4, 5, 1]}), container)

		assert.html(container, `
			<ul>
				<li>6</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>1</li>
			</ul>
		`)
	})

	it('[simple] - a, b, c, d, e, q, f, g -> a, b, f, d, c, g', () => {
		render(h(List, {type: 'li', data: ['a', 'b', 'c', 'd', 'e', 'q', 'f', 'g']}), container)
		render(h(List, {type: 'li', data: ['a', 'b', 'f', 'd', 'c', 'g']}), container)

		assert.html(container, `
			<ul>
				<li>a</li>
				<li>b</li>
				<li>f</li>
				<li>d</li>
				<li>c</li>
				<li>g</li>
			</ul>
		`)
	})

	it('[simple] - w, g, c, f, d, b, a, z -> w, a, b, f, d, c, g, z', () => {
		render(h(List, {type: 'li', data: ['w', 'g', 'c', 'f', 'd', 'b', 'a', 'z']}), container)
		render(h(List, {type: 'li', data: ['w', 'a', 'b', 'f', 'd', 'c', 'g', 'z']}), container)

		assert.html(container, `
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
		`)
	})

	it('[simple] - 1, 2, 3, 4, 5 -> 6, 7, 8, 9, 10, 11', () => {
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5]}), container)
		render(h(List, {type: 'li', data: [6, 7, 8, 9, 10, 11]}), container)

		assert.html(container, `
			<ul>
				<li>6</li>
				<li>7</li>
				<li>8</li>
				<li>9</li>
				<li>10</li>
				<li>11</li>
			</ul>
		`, '')
	})

	it('[simple] - 1, 5 -> 1, 2, 3, 4, 5', () => {
		render(h(List, {type: 'li', data: [1, 5]}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
			</ul>
		`)
	})

	it('[simple] - 1, 2, 5, 6, 7 -> 1, 2, 3, 4, 5, 6', () => {
		render(h(List, {type: 'li', data: [1, 2, 5, 6, 7]}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`)
	})

	it('[simple] - 1, 2, 3, 4, 5, 6 -> 1, 2, 4, 5, 6', () => {
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)
		render(h(List, {type: 'li', data: [1, 2, 4, 5, 6]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`)
	})

	it('[complex] - 1, 2, 3, 4, 5, 6 -> 1, 40, 0, 3, 4, 2, 5, 6, 60', () => {
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)
		render(h(List, {type: 'li', data: [1, 40, 0, 3, 4, 2, 5, 6, 60]}), container)

		assert.html(container, `
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
		`)
	})

	it('[complex] - 1, 40, 0, 3, 4, 2, 5, 6, 60 -> 1, 2, 3, 0, 5, 6, 90, 4', () => {
		render(h(List, {type: 'li', data: [1, 40, 0, 3, 4, 2, 5, 6, 60]}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 0, 5, 6, 90, 4]}), container)

		assert.html(container, `
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
		`)
	})

	it('[complex] - 0, 2, 4, 6, 8 -> 0, 1, 2, 3, 4, 5, 6, 7, 8', () => {
		render(h(List, {type: 'li', data: [0, 2, 4, 6, 8]}), container)
		render(h(List, {type: 'li', data: [0, 1, 2, 3, 4, 5, 6, 7, 8]}), container)

		assert.html(container, `
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
		`)
	})

	it('[complex] - 1, 40, 0, 3, 4, 2, 5, 6, 60 -> 1, 2, 3, 4, 5, 6', () => {
		render(h(List, {type: 'li', data: [1, 40, 0, 3, 4, 2, 5, 6, 60]}), container)
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`)
	})

	it('[complex] - a, b, d, f, c -> c, b, d, r, a', () => {
		render(h(List, {type: 'li', data: ['a', 'b', 'd', 'f', 'c']}), container)
		render(h(List, {type: 'li', data: ['c', 'b', 'd', 'r', 'a']}), container)

		assert.html(container, `
			<ul>
				<li>c</li>
				<li>b</li>
				<li>d</li>
				<li>r</li>
				<li>a</li>
			</ul>
		`)
	})

	it('[complex] - 1, 40, 0, 4, 2, 5, 6, 60 -> 1, 2, 4, 5, 6', () => {
		let A = class {
			render({children}) {
				return h('li', children)
			}
		}

		render(h(List, {type: A, data: [1, 40, 0, 4, 2, 5, 6, 60]}), container)
		render(h(List, {type: A, data: [1, 2, 4, 5, 6]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`)
	})
})
