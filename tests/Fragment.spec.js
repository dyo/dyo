test('Fragment', ({assert, done})=>{
	var container = document.createElement('div')

	class Fragment {
		render() {
			return [h('br'), this.props.children]
		}
	}
	
	render([
		h('h1', {key: '1st'}, '1st'),
	], container)
	assert(compare(container, '<h1>1st</h1>'), 'render fragment')

	render([
		h('h1', {key: '1st'}, '1st'),
		h('h1', {key: '2nd'}, '2nd')
	], container)
	assert(compare(container, '<h1>1st</h1><h1>2nd</h1>'), 'append to fragment')

	render([
		h('h1', {key: '1st'}, '1st'),
	], container)
	assert(compare(container, '<h1>1st</h1>'), 'remove from fragment end')

	render([
		h('h1', {key: '1st'}, '1st'),
		h('h1', {key: '3nd'}, '3nd'),
		h('h1', {key: '2nd'}, '2nd')
	], container)
	assert(compare(container, '<h1>1st</h1><h1>3nd</h1><h1>2nd</h1>'), 'append multiple to fragment')
	
	render([
		h('h1', {key: '1st'}, '1st'),
		h('h1', {key: '2nd'}, '2nd')
	], container)
	assert(compare(container, '<h1>1st</h1><h1>2nd</h1>'), 'remove from fragment middle')

	render([
		h('h1', {key: '1st'}, '1st'),
		h('h1', {key: '3nd'}, '3nd'),
		h('h1', {key: '2nd'}, '2nd')
	], container)
	assert(compare(container, '<h1>1st</h1><h1>3nd</h1><h1>2nd</h1>'), 'append insert into fragment middle')

	render([
		h('h1', {key: '4th'}, '4th'),
		h('h1', {key: '1st'}, '1st'),
		h('h1', {key: '3nd'}, '3nd'),
		h('h1', {key: '2nd'}, '2nd')
	], container)
	assert(compare(container, '<h1>4th</h1><h1>1st</h1><h1>3nd</h1><h1>2nd</h1>'), 'insert into fragment head')

	render(h('h1', 'replaced'), container)
	assert(compare(container, '<h1>replaced</h1>'), 'replace fragment')

	render([
		h(Fragment, {key: 1}, 1),
	], container)
	assert(compare(container, '<br>1'), 'render nested fragment')

	render([
		h(Fragment, {key: 1}, 1),
		h(Fragment, {key: 2}, 2)
	], container)
	assert(compare(container, '<br>1<br>2'), 'render multiple nested fragment')

	render([
		h(Fragment, {key: 1}, 1),
	], container)
	assert(compare(container, '<br>1'), 'remove nested fragment')

	render([
		h(Fragment, {key: 1}, 1),
		h(Fragment, {key: 3}, 3),
		h(Fragment, {key: 2}, 2)
	], container)
	assert(compare(container, '<br>1<br>3<br>2'), 'append nested fragment')

	render([
		h(Fragment, {key: 1}, 1),
		h(Fragment, {key: 2}, 2),
	], container)
	assert(compare(container, '<br>1<br>2'), 'remove nested fragment from middle')

	render([
		h(Fragment, {key: 1}, 1),
		h(Fragment, {key: 3}, 3),
		h(Fragment, {key: 2}, 2)
	], container)
	assert(compare(container, '<br>1<br>3<br>2'), 'insert nested fragment into middle')

	done()
})
