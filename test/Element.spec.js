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
			FunctionalComponent1 = ({name}) => name,
			FunctionalComponent2 = ({name}) => name,
			FunctionalComponent3 = ({name}) => name,
			FunctionalComponent4 = ({name}) => name,

			TestBase = class extends Component {
				render() {
					return this.props.name
				}
			},

			ClassBasedComponent1 = class extends TestBase {},
			ClassBasedComponent2 = class extends TestBase {},
			ClassBasedComponent3 = class extends TestBase {},
			ClassBasedComponent4 = class extends TestBase {},

			runTask = (type, name) => {
				render(
					createElement(type, {name}),
					document.createElement('div'))
			},

			task1 = () => runTask(FunctionalComponent1, 'Jane Doe'),
			task2 = () => runTask(FunctionalComponent2, 'Jane Doe'),
			task3 = () => runTask(FunctionalComponent3, 'Jane Doe'),
			task4 = () => runTask(FunctionalComponent4, 'Jane Doe'),
			task5 = () => runTask(ClassBasedComponent1, 'John Doe'),
			task6 = () => runTask(ClassBasedComponent2, 'John Doe'),
			task7 = () => runTask(ClassBasedComponent3, 'John Doe'),
			task8 = () => runTask(ClassBasedComponent4, 'John Doe')

		FunctionalComponent1.displayName = 'FunctionComponent1'
		FunctionalComponent2.displayName = 'FunctionComponent2'
		FunctionalComponent3.displayName = 'FunctionComponent3'
		FunctionalComponent4.displayName = 'FunctionComponent4'

		ClassBasedComponent1.displayName = 'ClassComponent1'
		ClassBasedComponent2.displayName = 'ClassComponent2'
		ClassBasedComponent3.displayName = 'ClassComponent3'
		ClassBasedComponent4.displayName = 'ClassComponent4'

		FunctionalComponent1.propTypes = {
			name: () => null
		}

		FunctionalComponent2.propTypes = {
			name: (...args) => new Error(JSON.stringify(args)) 
		}

		FunctionalComponent3.propTypes = {
			name: 'This is not a validator function!'
		}

		FunctionalComponent4.propTypes = {
			name: () => 'This is an illegal validation result!'
		}

		ClassBasedComponent1.propTypes = () => null

		ClassBasedComponent2.propTypes = {
			name: (...args) => new Error(JSON.stringify(args)) 
		}

		ClassBasedComponent3.propTypes = {
			name: 'This is not a validator function!'
		}

		ClassBasedComponent4.propTypes = {
			name: () => 'This is an illegal validation result!'
		}

		if (process.env.NODE_ENV === 'development') {
			assert.doesNotThrow(task1)
			assert.throws(task2, '[{"name":"Jane Doe"},"name","FunctionComponent2","prop",null]')
			assert.throws(task3, 'Validator for propTypes.name of component FunctionComponent3 must be a function')
			assert.throws(task4, 'Invalid return value for validator propTypes.name of component FunctionComponent4, must either be null or an object of type Error')

			assert.doesNotThrow(task5)
			assert.throws(task6, '[{"name":"John Doe"},"name","ClassComponent2","prop",null]')
			assert.throws(task7, 'Validator for propTypes.name of component ClassComponent3 must be a function')
			assert.throws(task8, 'Invalid return value for validator propTypes.name of component ClassComponent4, must either be null or an object of type Error')
		} else {
			assert.doesNotThrow(task1)
			assert.doesNotThrow(task2)
			assert.doesNotThrow(task3)
			assert.doesNotThrow(task4)
			assert.doesNotThrow(task5)
			assert.doesNotThrow(task6)
			assert.doesNotThrow(task7)
			assert.doesNotThrow(task8)
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
