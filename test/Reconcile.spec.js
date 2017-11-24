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

	it('[replace] - 1, 2, 3, 4, 5 -> 6, 7, 8, 9, 10, 11', () => {
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

	it('[reverse] - 1, 2 -> 2, 1', () => {
		render(h(List, {type: 'li', data: [1, 2]}), container)
		render(h(List, {type: 'li', data: [2, 1]}), container)

		assert.html(container, `
			<ul>
				<li>2</li>
				<li>1</li>
			</ul>
		`)

		let A = class {
			render({children}) {
				return [h('li', children)]
			}
		}

		render(h(List, {type: A, data: [2, 1]}), container)
		render(h(List, {type: A, data: [1, 2]}), container)

		assert.html(container, `
			<ul>
				<li>1</li>
				<li>2</li>
			</ul>
		`)
	})

	it('[reverse] - 1, 2, 3 -> 3, 2, 1', () => {
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

	it('[reverse] - 1, 2, 3, 4, 5, 6 -> 6, 2, 3, 4, 5, 1', () => {
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

	it('[complex] - 1, 2, 3, 4, 5, 6 -> 1, 2, 4, 5, 6', () => {
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

	it('[complex] - a, b, c, d, e, q, f, g -> a, b, f, d, c, g', () => {
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

	it('[complex] - w, g, c, f, d, b, a, z -> w, a, b, f, d, c, g, z', () => {
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

	it('[complex] - a, b, d, f, c -> c, b, d, r, a', () => {
		let A = class {
			render({children}) {
				return h('li', children)
			}
		}

		render(h(List, {type: A, data: ['a', 'b', 'd', 'f', 'c']}), container)
		render(h(List, {type: A, data: ['c', 'b', 'd', 'r', 'a']}), container)

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

	it('[complex] - a, b, d, f, c -> c, b, d, r, a', () => {
		let A = class {
			render({children}) {
				return [h('li', children)]
			}
		}

		render(h(List, {type: A, data: ['a', 'b', 'd', 'f', 'c']}), container)
		render(h(List, {type: A, data: ['c', 'b', 'd', 'r', 'a']}), container)

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

	it('[complex] - 1, 2, 3, 4, 5, 6 -> 6, 3, 2, 5, 4, 1', () => {
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)
		render(h(List, {type: 'li', data: [6, 3, 2, 5, 4, 1]}), container)

		assert.html(container, `
			<ul>
				<li>6</li>
				<li>3</li>
				<li>2</li>
				<li>5</li>
				<li>4</li>
				<li>1</li>
			</ul>
		`)
	})

	it('[complex] - 7, 6, 5, 4, 3, 2 -> 6, 5, 4, 3, 2, 1', () => {
		render(h(List, {type: 'li', data: [7, 6, 5, 4, 3, 2]}), container)

		assert.trace(() => {
			render(h(List, {type: 'li', data: [6, 5, 4, 3, 2, 1]}), container)
		}, {
			createElement: 1,
			createTextNode: 1,
			appendChild: 2,
			removeChild: 1,
			length: 5
		})

		assert.html(container, `
			<ul>
				<li>6</li>
				<li>5</li>
				<li>4</li>
				<li>3</li>
				<li>2</li>
				<li>1</li>
			</ul>
		`)
	})

	it('[complex] - 6, 5, 4, 3, 2, 1 -> 7, 6, 5, 4, 3, 2', () => {
		render(h(List, {type: 'li', data: [6, 5, 4, 3, 2, 1]}), container)

		assert.trace(() => {
			render(h(List, {type: 'li', data: [7, 6, 5, 4, 3, 2]}), container)
		}, {
			createElement: 1,
			createTextNode: 1,
			appendChild: 1,
			insertBefore: 1,
			removeChild: 1,
			length: 5
		})

		assert.html(container, `
			<ul>
				<li>7</li>
				<li>6</li>
				<li>5</li>
				<li>4</li>
				<li>3</li>
				<li>2</li>
			</ul>
		`)
	})

	it('[complex] - 1, 2, 3, 4, 5, 6 -> 2, 3, 4, 5, 6, 1', () => {
		render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)

		assert.trace(() => {
		  render(h(List, {type: 'li', data: [2, 3, 4, 5, 6, 1]}), container)
		}, {
			appendChild: 1,
			length: 1
		})

		assert.html(container, `
			<ul>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
				<li>1</li>
			</ul>
		`)
	})

	it('[complex] - 2, 3, 4, 5, 6, 1 -> 1, 2, 3, 4, 5, 6', () => {
		render(h(List, {type: 'li', data: [2, 3, 4, 5, 6, 1]}), container)

		assert.trace(() => {
			render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)
		}, {
			insertBefore: 1,
			length: 1
		})

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

	it('[complex] - 0, 2, 3, 4, 5, 6, 1 -> 0, 1, 2, 3, 4, 5, 6', () => {
		render(h(List, {type: 'li', data: [0, 2, 3, 4, 5, 6, 1]}), container)

		assert.trace(() => {
			render(h(List, {type: 'li', data: [0, 1, 2, 3, 4, 5, 6]}), container)
		}, {
			insertBefore: 1,
			length: 1
		})

		assert.html(container, `
			<ul>
				<li>0</li>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`)
	})

	it('[complex] - 0, 2, 3, 4, 5, 6, 1, 7 -> 0, 1, 2, 3, 4, 5, 6', () => {
		render(h(List, {type: 'li', data: [0, 2, 3, 4, 5, 6, 1, 7]}), container)

		assert.trace(() => {
			render(h(List, {type: 'li', data: [0, 1, 2, 3, 4, 5, 6]}), container)
		}, {
			removeChild: 1,
			insertBefore: 1,
			length: 2
		})

		assert.html(container, `
			<ul>
				<li>0</li>
				<li>1</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>5</li>
				<li>6</li>
			</ul>
		`)
	})

	it('[complex] - 2, 3, 4, 5, 6, 1, 0 -> 1, 2, 3, 4, 5, 6', () => {
		render(h(List, {type: 'li', data: [2, 3, 4, 5, 6, 1, 0]}), container)

		assert.trace(() => {
			render(h(List, {type: 'li', data: [1, 2, 3, 4, 5, 6]}), container)
		}, {
			removeChild: 1,
			insertBefore: 1,
			length: 2
		})

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

	it('[complex] - 0, 2, 3, 4, 5, 6, 1, 7 -> 0, 7, 2, 3, 4, 1, 6', () => {
		render(h(List, {type: 'li', data: [0, 2, 3, 4, 5, 6, 1, 7]}), container)

		assert.trace(() => {
			render(h(List, {type: 'li', data: [0, 7, 2, 3, 4, 1, 6]}), container)
		}, {
			removeChild: 1,
			insertBefore: 2,
			length: 3
		})

		assert.html(container, `
			<ul>
				<li>0</li>
				<li>7</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>1</li>
				<li>6</li>
			</ul>
		`)
	})

	it('[complex] - 0, 2, 3, 4, 5, 6, 1, 7 -> 0, 5, 2, 3, 4, 1, 6', () => {
		render(h(List, {type: 'li', data: [0, 2, 3, 4, 5, 6, 1, 7]}), container)

		assert.trace(() => {
			render(h(List, {type: 'li', data: [0, 5, 2, 3, 4, 1, 6]}), container)
		}, {
			removeChild: 1,
			insertBefore: 2,
			length: 3
		})

		assert.html(container, `
			<ul>
				<li>0</li>
				<li>5</li>
				<li>2</li>
				<li>3</li>
				<li>4</li>
				<li>1</li>
				<li>6</li>
			</ul>
		`)
	})

	it('[replace] - 0, 1 -> 0, 1, 2*', () => {
		render(
			h('ul',
				h('li', {key: 0}, 0),
				h('li', {key: 1}, 1)
			),
		container)

		render(
			h('ul',
				h('li', {key: 0}, 0),
				h('li', {key: 1}, 1),
				h('h2', {key: 2}, 2)
			),
		container)

		assert.html(container, `
			<ul>
				<li>0</li>
				<li>1</li>
				<h2>2</h2>
			</ul>
		`)
	})

	it('[replace] - 0, 1 -> 0, 1*, 2', () => {
		render(
			h('ul',
				h('li', {key: 0}, 0),
				h('li', {key: 1}, 1)
			),
		container)

		render(
			h('ul',
				h('li', {key: 0}, 0),
				h('h2', {key: 1}, 1),
				h('li', {key: 2}, 2)
			),
		container)

		assert.html(container, `
			<ul>
				<li>0</li>
				<h2>1</h2>
				<li>2</li>
			</ul>
		`)
	})

	it('[replace] - 0, 1 -> 0*, 1, 2', () => {
		render(
			h('ul',
				h('li', {key: 0}, 0),
				h('li', {key: 1}, 1)
			),
		container)

		render(
			h('ul',
				h('h2', {key: 0}, 0),
				h('li', {key: 1}, 1),
				h('li', {key: 2}, 2)
			),
		container)

		assert.html(container, `
			<ul>
				<h2>0</h2>
				<li>1</li>
				<li>2</li>
			</ul>
		`)
	})
})
