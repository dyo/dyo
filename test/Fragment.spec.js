describe('List', () => {
	let container = document.createElement('div')
	let List = class {
		render() {
			return [h('br'), this.props.children]
		}
	}

	it('should render a fragment', () => {
		render([
			h('h1', {key: '1st'}, '1st'),
		], container)

		assert.html(container, `
			<h1>1st</h1>
		`)
	})

	it('should append to tail of a fragment', () => {
		render([
			h('h1', {key: '1st'}, '1st'),
			h('h1', {key: '2nd'}, '2nd')
		], container)

		assert.html(container, `
			<h1>1st</h1><h1>2nd</h1>
		`)
	})

	it('should remove an element from the tail of a fragment', () => {
		render([
			h('h1', {key: '1st'}, '1st'),
		], container)

		assert.html(container, `
			<h1>1st</h1>
		`)
	})

	it('should append multiple elements to the tail of a fragment', () => {
		render([
			h('h1', {key: '1st'}, '1st'),
			h('h1', {key: '3nd'}, '3nd'),
			h('h1', {key: '2nd'}, '2nd')
		], container)

		assert.html(container, `
			<h1>1st</h1>
			<h1>3nd</h1>
			<h1>2nd</h1>
		`)
	})

	it('should remove an element from the middle of a fragment', () => {
		render([
			h('h1', {key: '1st'}, '1st'),
			h('h1', {key: '2nd'}, '2nd')
		], container)

		assert.html(container, `
			<h1>1st</h1>
			<h1>2nd</h1>
		`)
	})

	it('should insert an element into the middle of a fragment', () => {
		render([
			h('h1', {key: '1st'}, '1st'),
			h('h1', {key: '3nd'}, '3nd'),
			h('h1', {key: '2nd'}, '2nd')
		], container)

		assert.html(container, `
			<h1>1st</h1>
			<h1>3nd</h1>
			<h1>2nd</h1>
		`)
	})

	it('should insert an element as to the head of a fragment', () => {
		render([
			h('h1', {key: '4th'}, '4th'),
			h('h1', {key: '1st'}, '1st'),
			h('h1', {key: '3nd'}, '3nd'),
			h('h1', {key: '2nd'}, '2nd')
		], container)

		assert.html(container, `
			<h1>4th</h1><h1>1st</h1><h1>3nd</h1><h1>2nd</h1>
		`)
	})

	it('should replace a fragment', () => {
		render(h('h1', 'replaced'), container)

		assert.html(container, `
			<h1>replaced</h1>
		`)
	})

	it('should render a single fragment within a fragment', () => {
		render([
			h(List, {key: 1}, 1),
		], container)

		assert.html(container, `
			<br>1
		`)
	})

	it('should render multiple fragments within a fragment', () => {
		render([
			h(List, {key: 1}, 1),
			h(List, {key: 2}, 2)
		], container)

		assert.html(container, '<br>1<br>2')
	})

	it('should remove a fragment from a fragment', () => {
		render([
			h(List, {key: 1}, 1),
		], container)

		assert.html(container, `
			<br>1
		`)
	})

	it('should append a fragment to the end of a fragment', () => {
		render([
			h(List, {key: 1}, 1),
			h(List, {key: 3}, 3),
			h(List, {key: 2}, 2)
		], container)

		assert.html(container, `
			<br>1
			<br>3
			<br>2
		`)
	})

	it('should remove a fragment from the middle of a fragment', () => {
		render([
			h(List, {key: 1}, 1),
			h(List, {key: 2}, 2),
		], container)

		assert.html(container, `
			<br>1
			<br>2
		`)
	})

	it('should insert a fragment into the middle of a fragment', () => {
		render([
			h(List, {key: 1}, 1),
			h(List, {key: 3}, 3),
			h(List, {key: 2}, 2)
		], container)

		assert.html(container, `
			<br>1
			<br>3
			<br>2
		`)
	})

	it('should move(append) a nested fragment', () => {
		render([
			h(List, {key: 1}, 1),
			h(List, {key: 2}, 2),
			h(List, {key: 3}, 3)
		], container)

		assert.html(container, `
			<br>1
			<br>2
			<br>3
		`)
	})

	it('should render Fragment component', () => {
		render(h(Fragment, h('h1', {key: '1st'}, '1st')), container)

		assert.html(container, `
			<h1>1st</h1>
		`)
	})

	it('should move(append) an element within a fragment', () => {
		unmountComponentAtNode(container)

		render([
			h('li', {key: 1}, 1),
			h('li', {key: 3}, 3),
			h('li', {key: 2}, 2)
		], container)

		render([
			h('li', {key: 1}, 1),
			h('li', {key: 2}, 2),
			h('li', {key: 3}, 3)
		], container)

		assert.html(container, `
			<li>1</li>
			<li>2</li>
			<li>3</li>
		`)
	})
})
