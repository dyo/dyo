if (typeof require === 'function' && typeof module === 'object') {
	var zep = require('./zep.js');
}

zep(['../dio.js'], function (utili, deps) {
	'use strict';

	var {dio, h} = deps;
	var {describe, spy} = utili;

	describe('hyperscript', function (assert) {
		assert(
			h('div').type === 'div', 
			"h('div')"
		);

		assert(
			h('.class').type === 'div' && 
			h('.class').props.className === 'class', 
			"h('.class')"
		);

		assert(
			h('#id').type === 'div' && 
			h('#id').props.id === 'id', 
			"h('#id')"
		);

		assert(
			h('[title=bar]').type === "div" &&
			h('[title=bar]').props.title === "bar" &&
			h('[title=\'bar\']').props.title === "bar" && 
			h('[title="bar"]').props.title === "bar", 
			"h('[title=bar]')"
		);

		assert(
			h('[checkbox]').props.checkbox === true,
			"h('[checkbox]')"
		);

		assert(
			h('div', 1).children[0].children[0] === '1',
			"h('div', 1)"
		);

		assert(
			h('div', 1, 2, 3).children[1].children[0] === '2',
			"h('div', 1, 2, 3)"
		);

		assert(
			h('div', [1]).children[0].children[0] === '1',
			"h('div', [1])"
		);

		assert(
			h('div', [1,2], 3).children[2].children[0] === '3',
			"h('div', [1,2], 3)"
		);

		assert(
			h('div', [1,2], [3,4]).children[2].children[0] === '3',
			"h('div', [1,2], [3,4])"
		);

		assert(
			h('div', {title: 'foo'}).props.title === 'foo',
			"h('div', {title: 'foo'})"
		);

		assert(
			h('div', h('h1', 1)).children[0].children[0].children[0] === '1' &&
			h('div', h('h1', 1)).children[0].type === 'h1',
			"h('div', h('h1', 1))"
		);

		assert(
			h('div', {class: ''}).props.className === undefined,
			"h('div', {class: ''})"
		);

		assert(
			h('div', {className: ''}).props.class === undefined,
			"h('div', {className: ''})"
		);
	});

	describe('dio.createStream', function(assert) {
		var foo = dio.createStream(3);
		var bar = dio.createStream(2);
		var faz = dio.createStream('string');
		var pro = dio.createStream('100', Number);
		var the = dio.createStream('initial');
		var spye = spy();

		var fooMap = foo.map(function (value) {
			return value + 10;
		});
		
		var combine = dio.createStream.combine(function (a, b) {
			return a() + b();
		}, [foo, bar]);

		var combinePrev = dio.createStream.combine(function (a, b, prev) {
			spye(prev);
			return a();
		}, [foo, bar]);

		var fn  = spy();

		the.then(fn);

		the('changed');

		foo(2);

		combinePrev();
		combinePrev();
		
	    assert(foo() + bar() === 4, '.createStream()');
	    assert(pro() === 100, '.createStream(__, processor)');
	    assert(combine() === 4, '.createStream.combine()');
	    assert(fooMap() === 12, 'stream.map()' );
	    assert(fn.called, 'stream.then()');
	    assert(spye.called[1][0] === 2, '.combine(fn(a,b, prevValue))');
	});

	describe('dio.createHTML', function (assert) {
		var hyperscript = h('div', {class: 'foo' }, 'hello world');
		var render = dio.createRender({
			render: function () {
				return hyperscript;
			}
		});
		var component = dio.createComponent({
			render: function () {
				return hyperscript;
			}
		});

		var expectedOutput = '<div class="foo">hello world</div>';

		var hyperscriptHTML = dio.createHTML(hyperscript).replace(/\n|\t+/g, '');
		var renderHTML      = dio.createHTML(render).replace(/\n|\t+/g, '');
		var componentHTML   = dio.createHTML(component).replace(/\n|\t+/g, '');

		assert(hyperscriptHTML === expectedOutput, '.createHTML(hyperscript)');
		assert(renderHTML      === expectedOutput, '.createHTML(createRender)');
		assert(componentHTML   === expectedOutput, '.createHTML(createComponent)');
	});

	describe('dio.curry', function (assert) {
		function fn (a, b) {
			return a + b;
		};

		var e = {
			preventDefault: spy()
		};

		function event () {}

		var simple = dio.curry(fn, [1, 2]);
		var evt = dio.curry(event, null, true);

		evt(e);

		assert(simple() === 3, '.curry(fn, [a, b])');
		assert(e.preventDefault.called, '.curry(fn, __, true)');
	});

	describe('dio.createComponent', function (assert) {
		var hyperscript = h('div', {class: 'foo' }, 'hello world');

		function render () {
			return hyperscript
		}
		var obj = dio.createComponent({
			render: render
		});
		var fn = dio.createComponent(function () {
			return {
				render: render
			};
		});

		function isComponent (a) {
			a = a(0,0,1);

			var props = [
				'withAttr', 'setState', 'setProps', 
				'forceUpdate', 'state', 'props', 'render'
			];

			var state = props.filter(function (value) {
				return !!a[value];
			});

			return !!state.length;
		}

		assert.deepEqual(fn(), hyperscript, '.createComponent({Object})');
		assert.deepEqual(obj(), hyperscript, '.createComponent({Function})');
		assert.deepEqual(obj(), fn(), isComponent(obj), '.createComponent({Object}|{Function})');
		assert(isComponent(fn), '.createComponent({Function})(__, __, true)')
		assert(isComponent(obj), '.createComponent({Object})(__, __, true)')
	});

	describe('dio.createStore', function (assert) {
		function reducer (state, action) {
			state = state || {items: [1,2,3,4]}

			switch (action.type) {
				case 'ADD':
					return Object.assign({}, state, {items: state.items.concat([action.item])})
				default:
					return state;
			}
		}

		var store = dio.createStore(reducer);

		function isStore (a) {
			var props = ['connect', 'dispatch', 'getState', 'subscribe'];

			var state = props.filter(function (value) {
				return !!a[value];
			});

			return !!state.length;
		}

		var renderSpy = spy();
		var subscribeSpy = spy();

		assert(isStore(store), '.createStore({Function})');
		assert.deepEqual(store.getState(), {items: [1,2,3,4]}, 'store.getState()');

		store.dispatch({type: 'ADD', item: 10});

		assert.deepEqual(store.getState(), {items: [1,2,3,4,10]}, 'store.dispatch({Object})');

		store.subscribe(subscribeSpy);
		store.dispatch({type: 'ADD', item: 14});

		assert(subscribeSpy.called, 'store.subscribe(fn)');

		store.connect(renderSpy);
		store.dispatch({type: 'ADD', item: 33});

		assert(renderSpy.called, 'store.connect({createRender})');
	});

	describe('dio.createRender', function (assert) {
		var container;

		if (typeof document === 'object') {
			container = document.querySelector('.container');
		}

		var hyperscript = h('pre', {style: 'display:none;'}, '.createRender works');

		var render = dio.createRender({
			render: function () {
				return hyperscript;
			}
		}, container);

		var getHScriptFromRender = render(null, null,'@@dio/HYPERSCRIPT');

		render();

		if (container) {
			assert(container.children.length, '.createRender({Object}, element)');
		}

		var propsSpy = spy();
		var childrenSpy = spy();

		var render = dio.createRender({
			render: function (props) {				
				if (props.id) {
					propsSpy()
				}

				if (this.props.children) {
					childrenSpy()
				}

				return hyperscript;
			}
		}, '.container');

		render({id:1}, {item1: 'Text'});

		if (container) {
			assert(container.children.length, '.createRender({Object}, selector)');
			assert(container.children.length, 'render()');
			assert(childrenSpy.called, 'render(__, children)');
		}

		assert(propsSpy.called, 'render(props, __)');
		assert.deepEqual(getHScriptFromRender, hyperscript, "render(__, __, '@@dio/HYPERSCRIPT')");		
	});

	describe('dio.request', function (assert, done) {
		var spyer = spy();
		var requestJSON = dio.request.get('https://jsonplaceholder.typicode.com/users');

		requestJSON.then(spyer).then(function (value) {
			assert(true, '.get()');
			assert(true, '.then()');
			assert(value.length === spyer.called[0][0].length, '.get(CORS)');

			throw 'error';
		}).catch(function (e) {
			assert(e === 'error', '.catch(e => e)');
			// a request would naturally take the longest
			// lets end the test here.
			done();
		});

		if (typeof XMLHttpRequest !== 'function') {
			done();
		}

		dio.request.post('?', {id: 1234}, null, function () {
			assert(true, '(__, __, __, callback)');
		}).then(function (value) {
			assert(value.nodeType, '.post()')
		});
	});

	describe('dio.createStyle', function (assert) {
		var style = {
			h1: {
				color: 'red',
				span: {
					color: 'blue'
				}
			}
		};
		var expectedOutput = '<style> h1 {color: red;} h1 span {color: blue;}</style>';
		var expectedNSOutput = '<style id=#ns@@dio>#ns h1 {color: red;}#ns h1 span {color: blue;}</style>';

		var stylesheet = dio.createStyle(style, null, true).replace(/\t|\n+/g, '');
		var stylesheetNS = dio.createStyle(style, '#ns', true).replace(/\t|\n+/g, '');

		assert(stylesheet === expectedOutput, 'dio.createStyle(style)');
		assert(stylesheetNS === expectedNSOutput, 'dio.createStyle(style, namespace)');
	});
});