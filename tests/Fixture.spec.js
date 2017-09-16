test('Calling Lifecycle From Render', ({assert, done}) => {
	var updated = false
	var container = document.createElement('div')
	
	var C = function() {
	  if (updated === false) {
	    updated = true
	    this.forceUpdate()
	  }
	  return h('div', 'child')
	}

	var setState = null
	var updated2 = false
	
	var P = function(props, state) {
	  if (updated2 === false) {
	    updated2 = true
	    this.forceUpdate()
	  }
	  setState = this.setState.bind(this)

	  if (state.change)
	  	return h('p',
	  		[
		  		h('form'), 
		  		this.state.test ? C : void 0
		  	].filter(Boolean) 
		  )

	  return h('p', h('form', 'x'), state.test ? C : [])
	}

	P.getInitialState = function() {
	  return {
	    test: false
	  }
	}

	render(h(P), container)
	
	setState({
	  test: true
	})

	setTimeout(() => {
		assert(compare(container, '<p><form>x</form><div>child</div></p>'), 'calling forceUpdate from render')
		setState({
			change: true,
		  test: true
		})

	  setTimeout(() => {
	  	assert(compare(container, '<p><form></form><div>child</div></p>'), 'handle async mutations')
	  	done()
	  }, 20)
	}, 20)
})

test('Immutable Elements', ({assert, done})=>{
	var container = document.createElement('div')
	var without = (array, filtered) => array.filter(n => n != filtered)

	class Ripple {
		getInitialState() {
			return {$waves: []}
		}
		ripple({$$el}) {
			var {$waves} = this.state
			var $wave = h('div', {class: 'wave', key: 'a'}, 'wave')
			
			this.setState({$waves: $waves.concat($wave)})
			
			setTimeout(()=>{
				var {$waves} = this.state
				this.setState({$waves: without(this.state.$waves, $wave)})
			})
		}
		render() {
			var element = h('div', {
				class: 'ripple', onmousedown: (e) => this.ripple({$$el: e.currentTarget})
			}, this.state.$waves)

			return element
		}
	}

	render(Ripple, container)

	var r = container.querySelector('.ripple')
	var event = new Event('mousedown')

	r.dispatchEvent(event)
	r.dispatchEvent(event)

	setTimeout(()=>{
		r.dispatchEvent(event)
		r.dispatchEvent(event)

		setTimeout(()=>{
			assert(compare(container, '<div class="ripple"></div>'), 'handle hoisted elements')
			done()
		})
	})
})

test('Stable Reconciler', ({assert, done, deepEqual}) => {
	var container = document.body.appendChild(document.createElement('div'))
	var setState = null
	var stack = []
	var X = function () {
	  return h('div', 'x')
	}

	var List = function() {
	  setState = this.setState.bind(this);

	  return h('div', 
	  	this.state.on === true ? X : void 0, 
	  	h('div', 'y'), 
	  	this.state.on === true ? X : void 0
	  )
	}

	List.getInitialState = function() {
	  return {on: false}
	}

	render(h(List), container)
	stack.push(container.innerHTML)
	setState({on: true})
	stack.push(container.innerHTML)
	setState({on: true})
	stack.push(container.innerHTML)

	assert(
		deepEqual(stack, [
			'<div><div>y</div></div>', 
			'<div><div>x</div><div>y</div><div>x</div></div>', 
			'<div><div>x</div><div>y</div><div>x</div></div>'
		]),
		'should noop reconcile after replacement'
	)

	done()
})

test('Updating Component Props', ({assert, done, deepEqual}) => {
	var container = document.createElement('div')
	var stack = []

	setStateChild = null
	Child = function({x}) {
	  setStateChild = this.setState.bind(this)
	  return h('div', x)
	}

	Child.shouldComponentUpdate = function(props, state) {
		stack.push(this.props, props)
	  return PureComponent.prototype.shouldComponentUpdate.call(this, props, state)
	}

	setState = null
	Parent = function() {
	  setState = this.setState.bind(this)
	  return h('div', h(Child, {x: this.state.x}))
	}
	Parent.getInitialState = function() {return {x: 'abc'}}

	render(h(Parent), container)
	setState({x: 'xxx'})
	assert(deepEqual(stack[0], {x: 'abc'}) && deepEqual(stack[1], {x: 'xxx'}), 'pass props to component')

	setStateChild({abc: 1})
	assert(deepEqual(stack[2], {x: 'xxx'}) && deepEqual(stack[3], {x: 'xxx'}), 'update component props')
	done()
})

test('Assign Implicit Keys', ({assert, done, deepEqual}) => {
	var setState = null
	var stack = []
	var Y = function() {return h('div', 'y')}
	var X = function(props, {x, arr}) {
	  setState = this.setState.bind(this)

	  return h('div', (this.state.x ? [this.state.arr[0]] : this.state.arr).concat([h('div')]))
	}

	X.getInitialState = function() {return {x: false, arr: [Y, Y, Y]}}

	var container = document.createElement('div')

	render(X, container)
	stack.push(container.innerHTML)
	setState({x: true})
	stack.push(container.innerHTML)

	assert(
		deepEqual(stack, [
			'<div><div>y</div><div>y</div><div>y</div><div></div></div>', 
			'<div><div>y</div><div></div></div>'
		]), 
		'assign implicit keys'
	)

	done()
})
