test('Portal', ({assert, done})=>{
	var body = document.createElement('body')
	var container = document.createElement('main')
	var portal = document.createElement('ul')
	body.appendChild(container)
	body.appendChild(portal)

	render(
		h('div', 
			createPortal([
				h('li', {key: '1st'}, '1st')
			], portal),
			h('br')
		), 
	container)
	assert(compare(body, '<main><div><br></div></main><ul><li>1st</li></ul>'), 'render portal')
	
	render(
		h('div', 
			createPortal([
				h('li', {key: '1st'}, '1st'),
				h('li', {key: '2nd'}, '2nd')
			], portal),
			h('br')
		), 
	container)
	assert(compare(body, '<main><div><br></div></main><ul><li>1st</li><li>2nd</li></ul>'), 'append to portal')

	render(
		h('div', 
			createPortal([
				h('li', {key: '1st'}, '1st'),
				h('li', {key: '3rd'}, '3rd'),
				h('li', {key: '2nd'}, '2nd')
			], portal),
			h('br')
		), 
	container)
	assert(compare(body, '<main><div><br></div></main><ul><li>1st</li><li>3rd</li><li>2nd</li></ul>'), 'insert into portal middle')

	render(
		h('div', 
			createPortal([
				h('li', {key: '1st'}, '1st'),
				h('li', {key: '2nd'}, '2nd')
			], portal),
			h('br')
		), 
	container)
	assert(compare(body, '<main><div><br></div></main><ul><li>1st</li><li>2nd</li></ul>'), 'remove from portal middle')

	render(
		h('div', 
			createPortal([
				h('li', {key: '1st'}, '1st')
			], portal),
			h('br')
		), 
	container)
	assert(compare(body, '<main><div><br></div></main><ul><li>1st</li></ul>'), 'remove from portal end')

	render(
		h('div', 
			h('li', {key: '2nd'}, '2nd'),
			createPortal([
				h('li', {key: '1st'}, '1st')
			], portal),
			h('br')
		), 
	container)
	assert(compare(body, '<main><div><li>2nd</li><br></div></main><ul><li>1st</li></ul>'), 'insert before portal')

	render(
		h('div', 
			createPortal(h('li', {key: '1st'}, '1st'), portal),
			h('br')
		), 
	container)
	assert(compare(body, '<main><div><br></div></main><ul><li>1st</li></ul>'), '#createPortal element argument')

	render(null, container)
	assert(compare(body, '<main></main><ul></ul>'), 'remove nested child portal')

	done()
})
