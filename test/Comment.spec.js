describe('Comment', () => {
	it('should create a comment', () => {
		let container = document.createElement('div')

		render([
			createComment('1st')
		], container)

		assert.html(container, `<!--1st-->`)
	})

	it('should update a comment', () => {
		let container = document.createElement('div')

		render([
			createComment('1st')
		], container)

		assert.html(container, `<!--1st-->`)

		render([
			createComment('2nd')
		], container)

		assert.html(container, `<!--2nd-->`)
	})

	it('should remove a comment', () => {
		let container = document.createElement('div')

		render([
			createComment('1st')
		], container)

		assert.html(container, `<!--1st-->`)

		render([
		], container)

		assert.html(container, ``)
	})

	it('should append a comment', () => {
		let container = document.createElement('div')

		render([
		], container)

		assert.html(container, ``)

		render([
			createComment('1st')
		], container)

		assert.html(container, `<!--1st-->`)
	})

	it('should move(insert) a comment', () => {
		let container = document.createElement('div')

		render([
			createComment('1st', 1),
			createComment('2nd', 2),
			createComment('3rd', 3)
		], container)

		assert.html(container, `<!--1st--><!--2nd--><!--3rd-->`)

		render([
			createComment('3rd', 3),
			createComment('1st', 1),
			createComment('2nd', 2),
		], container)

		assert.html(container, `<!--3rd--><!--1st--><!--2nd-->`)
	})

	it('should move(append) a comment', () => {
		let container = document.createElement('div')

		render([
			createComment('3rd', 3),
			createComment('1st', 1),
			createComment('2nd', 2),
		], container)

		assert.html(container, `<!--3rd--><!--1st--><!--2nd-->`)

		render([
			createComment('1st', 1),
			createComment('2nd', 2),
			createComment('3rd', 3)
		], container)

		assert.html(container, `<!--1st--><!--2nd--><!--3rd-->`)
	})

	it('should replace a comment', () => {
		let container = document.createElement('div')

		render([
			createComment('1st')
		], container)

		assert.html(container, `<!--1st-->`)

		render([
			''
		], container)

		assert.html(container, ``)

		render([
			createComment('1st')
		], container)

		assert.html(container, `<!--1st-->`)

		render([
			null
		], container)

		assert.html(container, ``)
	})
})
