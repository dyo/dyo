import {h, render, createComment} from 'dyo'

describe('Comment', () => {
	it('should create a comment', () => {
		const target = document.createElement('div')

		render([createComment('1st')], target, (current) => {
			assert.html(current, `<!--1st-->`)
		})
	})

	it('should update a comment', () => {
		const target = document.createElement('div')

		render([createComment('1st')], target, (current) => {
			assert.html(current, `<!--1st-->`)
		})

		render([createComment('2nd')], target, (current) => {
			assert.html(current, `<!--2nd-->`)
		})
	})

	it('should remove a comment', () => {
		const target = document.createElement('div')

		render([createComment('1st')], target, (current) => {
			assert.html(current, `<!--1st-->`)
		})

		render([], target, (current) => {
			assert.html(current, ``)
		})
	})

	it('should append a comment', () => {
		const target = document.createElement('div')

		render([], target, (current) => {
			assert.html(current, ``)
		})

		render([createComment('1st')], target, (current) => {
			assert.html(current, `<!--1st-->`)
		})
	})

	it('should move(insert) a comment', () => {
		const target = document.createElement('div')

		render([
			createComment('1st', 1),
			createComment('2nd', 2),
			createComment('3rd', 3)
		], target, (current) => {
			assert.html(current, `<!--1st--><!--2nd--><!--3rd-->`)
		})

		render([
			createComment('3rd', 3),
			createComment('1st', 1),
			createComment('2nd', 2),
		], target, (current) => {
			assert.html(current, `<!--3rd--><!--1st--><!--2nd-->`)
		})
	})

	it('should move(append) a comment', () => {
		const target = document.createElement('div')

		render([
			createComment('3rd', 3),
			createComment('1st', 1),
			createComment('2nd', 2),
		], target, (current) => {
			assert.html(current, `<!--3rd--><!--1st--><!--2nd-->`)
		})

		render([
			createComment('1st', 1),
			createComment('2nd', 2),
			createComment('3rd', 3)
		], target, (current) => {
			assert.html(current, `<!--1st--><!--2nd--><!--3rd-->`)
		})
	})

	it('should replace a comment', () => {
		const target = document.createElement('div')

		render([createComment('1st')], target, (current) => {
			assert.html(current, `<!--1st-->`)
		})

		render([''], target, (current) => {
			assert.html(current, ``)
		})

		render([createComment('1st')], target, (current) => {
			assert.html(current, `<!--1st-->`)
		})

		render([null], target, (current) => {
			assert.html(current, ``)
		})
	})
})
