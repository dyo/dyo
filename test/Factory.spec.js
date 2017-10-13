describe('Factory', () => {
	it('should create an element factory', () => {
		let A = () => {}
		let factory = createFactory('h1')
		let element = factory({id: 'id'}, '1')

		assert.propertyVal(createFactory(A)(), 'type', A)

		assert.propertyVal(element, 'type', 'h1')
		assert.propertyVal(element.props, 'id', 'id')
		assert.propertyVal(element.children.next, 'children', '1')

		let composed = createFactory(element)('2')

		assert.propertyVal(composed, 'type', 'h1')
		assert.propertyVal(composed, 'type', 'h1')
		assert.propertyVal(composed.props, 'id', 'id')
		assert.propertyVal(composed.children.next, 'children', '2')
	})

	it('should create a render factory', () => {
		// @TODO build a test renderer
		let config = {
			setContent: () => {},
			setText: () => {},
			setEvent: () => {},
			setProps: () => {},

			getDocument: () => {},
			getTarget: () => {},
			getType: () => {},
			getProps: () => {},
			getPortal: () => {},
			getQuery: () => {},

			isValidHost: () => {},
			isValidNode: () => {},
			isValidEvent: () => {},

			removeNode: () => {},
			insertNode: () => {},
			appendNode: () => {},

			createElement: () => {},
			createText: () => {},
			createEmpty: () => {}
		}

		let factory = createFactory(config)

		assert.deepEqual(Object.keys(factory), [
			'version',
		  'render',
		  'hydrate',
		  'Component',
		  'PureComponent',
		  'Children',
		  'findDOMNode',
		  'unmountComponentAtNode',
		  'createFactory',
		  'cloneElement',
		  'isValidElement',
		  'createPortal',
		  'createElement',
		  'h',
		  'renderToString',
		  'renderToNodeStream',
		  '__SECRET_INTERNALS__'
		])

		assert.deepEqual(Object.keys(factory.__SECRET_INTERNALS__), [
			'mountComponentElement',
			'getComponentChildren',
			'invokeErrorBoundary',
			'getElementDefinition'
		])
	})
})
