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
				createPortal(h('li', {key: '1st'}, '1st'), '.modal'),
				h('br')
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
						<br>
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
				createPortal(h('li', {key: '1st'}, '1st')),
				h('br')
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
						<br>
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
