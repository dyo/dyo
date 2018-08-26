describe('PropTypes', () => {
	it('should validate propTypes for functional components just on DEV not on PROD', () => {
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

	it('should validate propTypes for class components just on DEV not on PROD', () => {
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
	})
})
