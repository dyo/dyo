describe('Fixture', () => {
	it('should require dyo module', () => {
		assert.hasAllDeepKeys(require('dyo'), [
			'Children',
			'Fragment',
			'Component',
			'PureComponent',
			'render',
			'isValidElement',
			'cloneElement',
			'createPortal',
			'createElement',
			'h'
		])
	})

	it('should require dyo server module', () => {
		assert.hasAllDeepKeys(require('dyo/server'), [
			'Children',
			'Fragment',
			'Component',
			'PureComponent',
			'render',
			'isValidElement',
			'cloneElement',
			'createPortal',
			'createElement',
			'h'
		])
	})

	it('should require dyo umd module', () => {
		assert.hasAllDeepKeys(require('dyo/dist/dyo.umd.js'), [
			'Children',
			'Fragment',
			'Component',
			'PureComponent',
			'render',
			'isValidElement',
			'cloneElement',
			'createPortal',
			'createElement',
			'h'
		])
	})

	it('should require dyo server umd module', () => {
		assert.hasAllDeepKeys(require('dyo/server/dist/dyo.umd.js'), [
			'Children',
			'Fragment',
			'Component',
			'PureComponent',
			'render',
			'isValidElement',
			'cloneElement',
			'createPortal',
			'createElement',
			'h'
		])
	})
})
