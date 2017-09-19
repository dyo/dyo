describe('Portal', ()=>{
	let body = document.createElement('body')
	let container = body.appendChild(document.createElement('main'))
	let portal = body.appendChild(document.createElement('ul'))

	it('should render a portal', () => {
		render(
			h('div', 
				createPortal([
					h('li', {key: '1st'}, '1st')
				], portal),
				h('br')
			), 
		container)

		assert.html(body, `
			<main>
				<div>
					<br>
				</div>
			</main>
			<ul>
				<li>1st</li>
			</ul>
		`)
	})

	it('should append to a portal', () => {
		render(
			h('div', 
				createPortal([
					h('li', {key: '1st'}, '1st'),
					h('li', {key: '2nd'}, '2nd')
				], portal),
				h('br')
			), 
		container)

		assert.html(body, `
			<main>
				<div>
					<br>
				</div>
			</main>
			<ul>
				<li>1st</li>
				<li>2nd</li>
			</ul>
		`)
	})

	it('insert into portal middle', () => {
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

		assert.html(body, `
			<main>
				<div>
					<br>
				</div>
			</main>
			<ul>
				<li>1st</li>
				<li>3rd</li>
				<li>2nd</li>
			</ul>`)
	})

	it('remove from portal middle', () => {
		render(
			h('div', 
				createPortal([
					h('li', {key: '1st'}, '1st'),
					h('li', {key: '2nd'}, '2nd')
				], portal),
				h('br')
			), 
		container)

		assert.html(body, `
			<main>
				<div>
					<br>
				</div>
			</main>
			<ul>
				<li>1st</li>
				<li>2nd</li>
			</ul>
			`)	
	})

	it('remove from portal end', () => {
		render(
			h('div', 
				createPortal([
					h('li', {key: '1st'}, '1st')
				], portal),
				h('br')
			), 
		container)

		assert.html(body, `
			<main>
				<div>
					<br>
				</div>
			</main>
			<ul>
				<li>1st</li>
			</ul>`)
	})
	
	it('should insert before portal', () => {
		render(
			h('div', 
				h('li', {key: '2nd'}, '2nd'),
				createPortal([
					h('li', {key: '1st'}, '1st')
				], portal),
				h('br')
			), 
		container)

		assert.html(body, `
			<main>
				<div>
					<li>2nd</li>
					<br>
				</div>
			</main>
			<ul>
				<li>1st</li>
			</ul>`)
	})

	it('should create a portal with a single child', () => {
		render(
			h('div', 
				createPortal(h('li', {key: '1st'}, '1st'), portal),
				h('br')
			), 
		container)

		assert.html(body, `
			<main>
				<div>
					<br>
				</div>
			</main>
			<ul>
				<li>1st</li>
			</ul>`)
	})

	it('should remove nested portal', () => {
		unmountComponentAtNode(container)
		
		assert.html(body, `
			<main>
			</main>
			<ul>
			</ul>`)
	})
})
