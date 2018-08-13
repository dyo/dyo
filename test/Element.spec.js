describe('Element', () => {
	it('should validate an element', () => {
		assert.isTrue(isValidElement(h('div')))
	})

	it('should not validate a non-element', () => {
		assert.isFalse(isValidElement('div'))
		assert.isFalse(isValidElement(1))
		assert.isFalse(isValidElement(function () {}))
		assert.isFalse(isValidElement({}))
		assert.isFalse(isValidElement(Object.assign({}, h('div'))))
	})

	it('should clone an element', () => {
		assert.equal(cloneElement(h('h1', {className: 'head'})).props.className, 'head')
		assert.equal(cloneElement(h('h1', {className: 'head'}), {className: 'change'}).props.className, 'change')
		assert.equal(cloneElement(h('h1', {ref: 'ref'})).ref, 'ref')
		assert.equal(cloneElement(h('h1', {xmlns: 'xmlns'})).xmlns, 'xmlns')
		assert.equal(cloneElement(h('h1', {key: 'key'})).key, 'key')

		assert.deepEqual(cloneElement(h(() => {}, {ref: 'ref'}, 1, 2)).props, {ref: 'ref', children: [1, 2]})
	})

	it('should create an element', () => {
		assert.equal(h('h1', 'Hello World').type, 'h1')
	})

	it('should create an element with a key', () => {
		assert.equal(h('h1', {key: 'bar'}).key, 'bar')
	})

	it('should create an element with a ref', () => {
		assert.equal(h('h1', {ref: 'bar'}).ref, 'bar')
	})

	it('should create an element with xmlns namespace', () => {
		assert.equal(h('h1', {xmlns: 'bar'}).xmlns, 'bar')
	})

	it('should create an element with children', () => {
		assert.equal(h('div', [1, 2], 3, h('h1')).children.length, 4)
	})

	it('should assign children to a component element', () => {
		assert.deepEqual(h(() => {}, 1, 2).props.children, [1, 2])
	})

	it('should assign opaque children to a component element', () => {
		assert.equal(h(() => {}, 1).props.children, 1)
	})

	it('should not assign children to a component element', () => {
		assert.isFalse(Array.isArray(h(() => {}).props.children))
	})

	it('should assign props to a component element', () => {
		assert.equal(h(() => {}, {id: 1}).props.id, 1)
	})

	it('should assign props as a non-pojo object', () => {
		let props = new (function () { this.id = 1 })
		assert.equal(h('h1', props).props.id, 1)
	})

	it('should assign props as an object with an empty prototype', () => {
		let props = Object.create(null, {id: {value: 1}})
		assert.equal(h('h1', props).props.id, 1)
	})

	it('should assign array children', () => {
		assert.lengthOf(h('h1', [1, 2]).children, 2)
	})

	it('should assign nested array children', () => {
		assert.lengthOf(h('h1', [1, 2, [3, 4]]).children, 4)
	})

	it('should assign multiple array children', () => {
		assert.lengthOf(h('h1', [1, 2], [1, 2]).children, 4)
	})

	it('should assign multiple nested array children', () => {
		assert.lengthOf(h('h1', [1, 2, [3, 4]], [1, 2, [3, 4]]).children, 8)
	})

	it('should assign an empty props object', () => {
		assert.deepEqual(h('h1').props, {})
		assert.deepEqual(h('h1', null).props, {})
		assert.deepEqual(h('h1', []).props, {})
		assert.deepEqual(h('h1', h('h1')).props, {})
		assert.deepEqual(h('h1', 1).props, {})
		assert.deepEqual(h('h1', '').props, {})
		assert.deepEqual(h('h1', () => {}).props, {})
	})

	it('should not assign element as props', () => {
		assert.doesNotHaveAnyKeys(h('div', h('h1')).props, ['type', 'props', 'children'])
	})

	it('should not assign an array as props', () => {
		let mock = Object.defineProperty([1, 2, 3], Symbol.iterator, {value: undefined})

		assert.equal(mock[Symbol.iterator], undefined)

		let element = h('div', mock)

		assert.deepEqual(element.props, {})
		assert.lengthOf(element.children, 3)
	}),

	it('should validate propTypes in development envoironment and ignore in production environment', () => {
		const
			FunctionalComponent1 = ({ name }) => name,
			FunctionalComponent2 = ({ name }) => name,

			ClassBasedComponent = class extends Component {
				render() {
					return this.props.name
				}
			},

			task1 = () => {
				render(
					createElement(FunctionalComponent1, { name: 'Jane Doe' }),
					document.createElement('div'))
			},
			
			task2 = () => {
				render(
					createElement(FunctionalComponent2, { name: 'Jane Doe' }),
					document.createElement('div'))
			},
			
			task3 = () => {
				render(
					createElement(ClassBasedComponent, { name: 'Jane Doe' }),
					document.createElement('div'))
			}

		FunctionalComponent1.propTypes = {
			name: (props, propName, componentName, location, fullPropName) =>
				new Error('Validation failed for prop '
					+ `"${propName}" of ${componentName} `
					+ `(location: ${location}, fullPropName: ${fullPropName}, props: ${JSON.stringify(props)})`)
		}

		FunctionalComponent2.propTypes = () => null

		FunctionalComponent1.displayName = 'SFRComponent1'
		FunctionalComponent2.displayName = 'SFRComponent2'

		ClassBasedComponent.propTypes = () => ({
			name: () => null
		})

		if (process.env.NODE_ENV === 'development') {
			assert.throws(task1, 'Validation failed for prop "name" of SFRComponent1 (location: prop, fullPropName: null, props: {"name":"Jane Doe"}')
			assert.doesNotThrow(task2)
			assert.doesNotThrow(task3)
		} else {
			assert.doesNotThrow(task1)
			assert.doesNotThrow(task2)
			assert.doesNotThrow(task3)
		}
	}),

	it('should validate propTypes of ContextProvider in development environment and ignore in production environment', () => {
		const
			TestCtx = createContext(),

			task = () =>
				render(
					createElement(TestCtx.Provider, { value: 42 }),
					document.createElement('div'))

		TestCtx.Provider.propTypes = {
			value: (props, propName, componentName, location, fullPropName) =>
				new Error('Validation failed for prop '
					+ `"${propName}" of ${componentName} `
					+ `(location: ${location}, fullPropName: ${fullPropName}, props: ${JSON.stringify(props)})`)
		}

		if (process.env.NODE_ENV === 'development') {
			assert.throws(task, 'Validation failed for prop "value" of ContextProvider (location: prop, fullPropName: null, props: {"value":42}')
		} else {
			assert.doesNotThrow(task)
		}
	})
})
