import {h, Component, render} from 'dyo'

describe('Event', () => {
	it('should dispatch event from element', () => {
		const target = document.createElement('div')
		const stack = []
		const refs = {}

		render(h('button', {ref: refs, onClick: () => stack.push(1)}), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, [1])
			assert.html(current, `<button></button>`)
		})
	})

	it('should dispatch event from component', () => {
		const target = document.createElement('div')
		const stack = []
		const refs = {}

		class Primary extends Component {
			handleEvent(event) { stack.push(event.type)}
			render() { return h('button', {ref: refs, onClick: this.handleEvent})}
		}

		render(h(Primary), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click'])
			assert.html(current, `<button></button>`)
		})
	})

	it('should dispatch object events', () => {
		const target = document.createElement('div')
		const stack = []
		const refs = {}

		class Primary extends Component {
			handleEvent(event) { stack.push(this.props) }
			render() { return h('button', {ref: refs, onClick: this})}
		}

		render(h(Primary, {props: 1}), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, [{props: 1}])
			assert.html(current, `<button></button>`)
		})
	})
	it('should dispatch invoke component events with (event, props, state, context) arguments', () => {
		const target = document.createElement('div')
		const stack = []
		const refs = {}

		class Primary extends Component {
			getChildContext() { return {context: 1} }
		}

		class Secondary extends Component {
			getDerivedState() { return {state: 1} }
			handleEvent(event, props, state, context) { stack.push(event.type, props, state, context) }
			render() { return h('button', {ref: refs, onClick: this})}
		}

		render(h(Primary, h(Secondary, {props: 1})), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click', {props: 1}, {state: 1}, {context: 1}])
			assert.html(current, `<button></button>`)
		})
	})

	it('should dispatch different events', () => {
		const target = document.createElement('div')
		const stack = []
		const refs = {}

		render(h('button', {ref: refs, onClick: (e) => stack.push(1), onMouseDown: (e) => stack.push(2)}), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			refs.current.dispatchEvent(new Event('mousedown'))
			assert.deepEqual(stack, [1, 2])
		})
	})

	it('should not dispatch invalid events', () => {
		const target = document.createElement('div')
		const stack = []
		const refs = {}

		render(h('button', {ref: refs, onClick: '', onMouseDown: null}), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			refs.current.dispatchEvent(new Event('mousedown'))
		})
	})

	it('should dispatch an array of valid events', () => {
		const target = document.createElement('div')
		const stack = []
		const refs = {}

		class Primary extends Component {
			handleEvent(event) { stack.push(event.type) }
			render() { return h('button', {ref: refs, onClick: [this, null, this.handleEvent, undefined]})}
		}

		render(h(Primary), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, ['click', 'click'])
			assert.html(current, `<button></button>`)
		})
	})

	it('should replace event', () => {
		const target = document.createElement('div')
		const stack = []
		const refs = {}

		render(h('button', {ref: refs, onClick: () => stack.push(1)}), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, [1])
		})

		render(h('button', {ref: refs, onClick: () => stack.push(2)}), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, [1, 2])
		})
	})

	it('should remove event', () => {
		const target = document.createElement('div')
		const stack = []
		const refs = {}

		render(h('button', {ref: refs, onClick: () => stack.push(1)}), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, [1])
		})

		render(h('button', {ref: refs}), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			assert.deepEqual(stack, [1])
		})
	})

	it('should dispatch an implicit state update from an event', () => {
		const target = document.createElement('div')
		const refs = {}

		class Primary extends Component {
			handleEvent(event) { return {value: 1} }
			render(props, state) { return h('button', {ref: refs, onClick: this.handleEvent}, state.value)}
		}

		render(h(Primary), target, (current) => {
			refs.current.dispatchEvent(new Event('click'))
			assert.html(current, '<button>1</button>')
		})
	})
})
