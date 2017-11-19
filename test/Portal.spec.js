describe('Portal', ()=>{
	let body = document.createElement('body')
	let container = body.appendChild(document.createElement('main'))
	let portal = body.appendChild(document.createElement('ul'))

	it('should assign a key to a portal', () => {
		assert.propertyVal(createPortal(h('title'), 'head', '#head'), 'key', '#head')
	})

	it('should render a portal', () => {
		render(
			h('div',
				createPortal([
					h('li', {key: '1st'}, '1st')
				], portal, 'portal-1')
			),
		container)

		assert.html(body, `
			<main>
				<div>
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
				], portal, 'portal-1')
			),
		container)

		assert.html(body, `
			<main>
				<div>
				</div>
			</main>
			<ul>
				<li>1st</li>
				<li>2nd</li>
			</ul>
		`)
	})

	it('should insert into portal middle', () => {
		render(
			h('div',
				createPortal([
					h('li', {key: '1st'}, '1st'),
					h('li', {key: '3rd'}, '3rd'),
					h('li', {key: '2nd'}, '2nd')
				], portal, 'portal-1')
			),
		container)

		assert.html(body, `
			<main>
				<div>
				</div>
			</main>
			<ul>
				<li>1st</li>
				<li>3rd</li>
				<li>2nd</li>
			</ul>`)
	})

	it('should move portal children', () => {
		render(
			h('div',
				createPortal([
					h('li', {key: '1st'}, '1st'),
					h('li', {key: '2nd'}, '2nd'),
					h('li', {key: '3rd'}, '3rd'),
				], portal, 'portal-1')
			),
		container)

		assert.html(body, `
			<main>
				<div>
				</div>
			</main>
			<ul>
				<li>1st</li>
				<li>2nd</li>
				<li>3rd</li>
			</ul>
			`)
	})

	it('should remove from portal middle', () => {
		render(
			h('div',
				createPortal([
					h('li', {key: '1st'}, '1st'),
					h('li', {key: '3rd'}, '3rd')
				], portal, 'portal-1')
			),
		container)

		assert.html(body, `
			<main>
				<div>
				</div>
			</main>
			<ul>
				<li>1st</li>
				<li>3rd</li>
			</ul>
			`)
	})

	it('should remove from portal end', () => {
		render(
			h('div',
				createPortal([
					h('li', {key: '1st'}, '1st')
				], portal, 'portal-1')
			),
		container)

		assert.html(body, `
			<main>
				<div>
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
				], portal, 'portal-1')
			),
		container)

		assert.html(body, `
			<main>
				<div>
					<li>2nd</li>
				</div>
			</main>
			<ul>
				<li>1st</li>
			</ul>`)
	})

	it('should create a portal with a single child', () => {
		unmountComponentAtNode(container)

		render(
			h('div',
				createPortal(h('li', {key: '1st'}, '1st'), portal, 'portal-1')
			),
		container)

		assert.html(body, `
			<main>
				<div>
				</div>
			</main>
			<ul>
				<li>1st</li>
			</ul>`)
	})

	it('should noop append nested portal', () => {
		unmountComponentAtNode(container)

		render(
			h('div',
				createPortal([
					h('li', {key: '1st'}, '1st'),
					createPortal([
						h('li', {key: '2nd'}, '2nd')
					], portal, 'portal-2')
				], portal, 'portal-1'),
				h('li', {key: '2nd'}, '2nd')
			),
		container)

		render(
			h('div',
				h('li', {key: '2nd'}, '2nd'),
				createPortal([
					createPortal([
						h('li', {key: '2nd'}, '2nd')
					], portal, 'portal-2'),
					h('li', {key: '1st'}, '1st')
				], portal, 'portal-1')
			),
		container)

		assert.html(body, `
			<main>
				<div>
					<li>2nd</li>
				</div>
			</main>
			<ul>
				<li>2nd</li>
				<li>1st</li>
			</ul>`)
	})

	it('should noop insert nested portal', () => {
		unmountComponentAtNode(container)

		render(
			h('div',
				h('li', {key: '2nd'}, '2nd'),
				createPortal([
					createPortal([
						h('li', {key: '2nd'}, '2nd')
					], portal, 'portal-2'),
					h('li', {key: '1st'}, '1st')
				], portal, 'portal-1')
			),
		container)

		render(
			h('div',
				createPortal([
					h('li', {key: '1st'}, '1st'),
					createPortal([
						h('li', {key: '2nd'}, '2nd')
					], portal, 'portal-2')
				], portal, 'portal-1'),
				h('li', {key: '2nd'}, '2nd')
			),
		container)

		assert.html(body, `
			<main>
				<div>
					<li>2nd</li>
				</div>
			</main>
			<ul>
				<li>2nd</li>
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

	it('should insert into nested portal', () => {
		unmountComponentAtNode(container)

		render(
			h('div',
				createPortal([
					createPortal([
						h('li', {key: '1st'}, '1st')
					], portal, 'portal-2')
				], portal, 'portal-1')
			),
		container)

		render(
			h('div',
				createPortal([
					createPortal([
						h('li', {key: '2nd'}, '2nd')
					], portal, 'portal-3'),
					createPortal([
						h('li', {key: '1st'}, '1st')
					], portal, 'portal-2')
				], portal, 'portal-1')
			),
		container)

		assert.html(body, `
			<main>
				<div>
				</div>
			</main>
			<ul>
				<li>1st</li>
				<li>2nd</li>
			</ul>`)
	})

	it('should append to one of two portals with the same container', () => {
		unmountComponentAtNode(container)

		render(
			h('div',
					createPortal([
						h('li', {key: '1st'}, '1st')
					], portal, 'portal-1'),
					createPortal([
						h('li', {key: '1st'}, '1st')
					], portal, 'portal-2'),
			),
		container)

		render(
			h('div',
				createPortal([
					h('li', {key: '1st'}, '1st'),
					h('li', {key: '2nd'}, '2nd')
				], portal, 'portal-1'),
				createPortal([
					h('li', {key: '3rd'}, '3rd')
				], portal, 'portal-2')
			),
		container)

		assert.html(body, `
			<main>
				<div>
				</div>
			</main>
			<ul>
				<li>1st</li>
				<li>2nd</li>
				<li>3rd</li>
			</ul>`)
	})

	it('should render a portal with a string container', () => {
		let html = document.createElement('html')
		let documentElement = document.documentElement
		html.innerHTML = '<head></head><body><div class="modal"></div><div class="container"></div></body>'
		let container = html.querySelector('.container')

		Object.defineProperty(document, 'documentElement', {
		  enumerable: true,
		  configurable: true,
		  writable: true,
		  value: html
		})

		render(
			h('div',
				createPortal(h('li', {key: '1st'}, '1st'), '.modal')
			),
		container)

		assert.html(html, `
			<head>
			</head>
			<body>
				<div class="modal">
					<li>1st</li>
				</div>
				<div class="container">
					<div>
					</div>
				</div>
			</body>
		`)

		Object.defineProperty(document, 'documentElement', {
		  enumerable: true,
		  configurable: true,
		  writable: true,
		  value: documentElement
		})
	})

	it('should render a portal to the implicit root container', () => {
		let html = document.createElement('html')
		let documentElement = document.documentElement
		html.innerHTML = '<head></head><body><div class="modal"></div><div class="container"></div></body>'
		let container = html.querySelector('.container')

		Object.defineProperty(document, 'documentElement', {
		  enumerable: true,
		  configurable: true,
		  writable: true,
		  value: html
		})

		render(
			h('div',
				createPortal(h('li', {key: '1st'}, '1st'))
			),
		container)

		assert.html(html, `
			<head>
			</head>
			<body>
				<div class="modal">
				</div>
				<div class="container">
					<div>
					</div>
				</div>
			</body>
			<li>1st</li>
		`)

		Object.defineProperty(document, 'documentElement', {
		  enumerable: true,
		  configurable: true,
		  writable: true,
		  value: documentElement
		})
	})
})
