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

	it('should validate propTypes for functional components in development envoironment and ignore in production environment', () => {
		const
			FunctionalComponent1 = ({name}) => name,
			FunctionalComponent2 = ({name}) => name,
			FunctionalComponent3 = ({name}) => name,
			FunctionalComponent4 = ({name}) => name,
			FunctionalComponent5 = ({name}) => name,

			runTask = (type, name) => {
				render(
					createElement(type, {name}),
					document.createElement('div'))
			},

			task1 = () => runTask(FunctionalComponent1, 'Jane Doe'),
			task2 = () => runTask(FunctionalComponent2, 'Jane Doe'),
			task3 = () => runTask(FunctionalComponent3, 'Jane Doe'),
			task4 = () => runTask(FunctionalComponent4, 'Jane Doe')
			task5 = () => runTask(FunctionalComponent5, 'Jane Doe')
		
		FunctionalComponent1.propTypes = {
			name: () => null,
			extra: () => true
		}

		FunctionalComponent2.propTypes = {
			name: (...args) => new Error(JSON.stringify(args)) 
		}

		FunctionalComponent3.propTypes = {
			name: 'This is not a validator function!'
		}

		FunctionalComponent4.propTypes = {
			name: () => false
		}

		FunctionalComponent5.propTypes = {
			name: () => 'Some error message'
		}

		if (process.env.NODE_ENV === 'development') {
			assert.doesNotThrow(task1)
			assert.throws(task2, '[{"name":"Jane Doe"},"name","FunctionalComponent2","prop",null]')
			assert.throws(task3),
			assert.throws(task4, "Invalid value for prop 'name' of 'FunctionalComponent4'")
			assert.throws(task5, 'Some error message')
		} else {
			assert.doesNotThrow(task1)
			assert.doesNotThrow(task2)
			assert.doesNotThrow(task3)
			assert.doesNotThrow(task4)
			assert.doesNotThrow(task5)
		}
	}),

	it('should validate propTypes for class components in development envoironment and ignore in production environment', () => {
		const
			TestBase = class extends Component {
				render() {
					return this.props.name
				}
			},

			ClassComponent1 = class extends TestBase {},
			ClassComponent2 = class extends TestBase {},
			ClassComponent3 = class extends TestBase {},
			ClassComponent4 = class extends TestBase {},
			ClassComponent5 = class extends TestBase {},

			runTask = (type, name) => {
				render(
					createElement(type, {name}),
					document.createElement('div'))
			},

			task1 = () => runTask(ClassComponent1, 'John Doe'),
			task2 = () => runTask(ClassComponent2, 'John Doe'),
			task3 = () => runTask(ClassComponent3, 'John Doe'),
			task4 = () => runTask(ClassComponent4, 'John Doe')
			task5 = () => runTask(ClassComponent5, 'John Doe')
		
		ClassComponent1.propTypes = () => null

		ClassComponent2.propTypes = () => ({
			name: (...args) => new Error(JSON.stringify(args)) 
		})

		ClassComponent3.propTypes = {
			name: 'This is not a validator function!'
		}

		ClassComponent4.propTypes = {
			name: () => false
		}

		ClassComponent5.propTypes = {
			name: () => 'Some error message'
		}

		if (process.env.NODE_ENV === 'development') {
			assert.doesNotThrow(task1)
			assert.throws(task2, '[{"name":"John Doe"},"name","ClassComponent2","prop",null]')
			assert.throws(task3),
			assert.throws(task4, "Invalid value for prop 'name' of 'ClassComponent4'")
			assert.throws(task5, 'Some error message')
		} else {
			assert.doesNotThrow(task1)
			assert.doesNotThrow(task2)
			assert.doesNotThrow(task3)
			assert.doesNotThrow(task4)
			assert.doesNotThrow(task5)
		}
	}),

	it('should validate propTypes for ref forwarders in development envoironment and ignore in production environment', () => {
		const
			RefForwarder1 = forwardRef(({ name }) => name)
			RefForwarder2 = forwardRef(({ name }) => name)
			RefForwarder3 = forwardRef(({ name }) => name)
			RefForwarder4 = forwardRef(({ name }) => name)
			RefForwarder5 = forwardRef(({ name }) => name)

			runTask = (type, name) => {
				render(
					createElement(type, {name}),
					document.createElement('div'))
			},

			task1 = () => runTask(RefForwarder1, 'Joan Doe')
			task2 = () => runTask(RefForwarder2, 'Joan Doe')
			task3 = () => runTask(RefForwarder3, 'Joan Doe')
			task4 = () => runTask(RefForwarder4, 'Joan Doe')
			task5 = () => runTask(RefForwarder5, 'Joan Doe')

		RefForwarder2.propTypes = {
			name: (...args) => new Error(JSON.stringify(args)) 
		}

		RefForwarder3.propTypes = {
			name: 'This is not a validator function!'
		}

		RefForwarder4.propTypes = {
			name: () => false 
		}

		RefForwarder5.propTypes = {
			name: () => 'Some error message'
		}

		if (process.env.NODE_ENV === 'development') {
			assert.doesNotThrow(task1)
			assert.throws(task2, '[{"name":"Joan Doe"},"name","ForwardRef","prop",null]')
			assert.throws(task3),
			assert.throws(task4, "Invalid value for prop 'name' of 'ForwardRef'")
			assert.throws(task5, 'Some error message')
		} else {
			assert.doesNotThrow(task1)
			assert.doesNotThrow(task2)
			assert.doesNotThrow(task3)
			assert.doesNotThrow(task4)
			assert.doesNotThrow(task5)
		}
	}),

	it('should validate propTypes of ContextProvider in development environment and ignore in production environment', () => {
		const
			TestCtx = createContext(),

			task = () =>
				render(
					createElement(TestCtx.Provider, {value: 42}),
					document.createElement('div'))

		TestCtx.Provider.propTypes = {
			value: (...args) => new Error(JSON.stringify(args)) 
		}

		if (process.env.NODE_ENV === 'development') {
			assert.throws(task, '[{"value":42},"value","ContextProvider","prop",null]')
		} else {
			assert.doesNotThrow(task)
		}
	})
})
