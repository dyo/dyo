test('Fixture I', ({assert, done}) => {
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
	
	var P = function() {
	  if (updated2 === false) {
	    updated2 = true
	    this.forceUpdate()
	  }
	  setState = this.setState.bind(this)
	  return h('p', h('form', 'x'), this.state.test ? C : [])
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

	setTimeout(function() {
		assert(compare(container, '<p><form>x</form><div>child</div></p>'), 'calling forceUpdate from render')
	  done()
	}, 20)
})

test('Fixture II', ({assert, done})=>{
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
