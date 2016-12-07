if (typeof require === 'function' && typeof module === 'object') {
	var zep = require('./zep.js');
}

zep(['../dio.js'], function (utili, deps) {
	'use strict';

	var dio = deps.dio || deps;
	var h = dio.h;
	
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
			h('[class=a]').type === 'div' && 
			h('[class=a]').props.className === 'a', 
			"h('[class=a]')"
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
			h('div', 1).children[0].children === 1,
			"h('div', 1)"
		);

		assert(
			h('div', 1, 2, 3).children[1].children === 2,
			"h('div', 1, 2, 3)"
		);

		assert(
			h('div', [1]).children[0].children === 1,
			"h('div', [1])"
		);

		assert(
			h('div', [1,2], 3).children[2].children === 3,
			"h('div', [1,2], 3)"
		);

		assert(
			h('div', [1,2], [3,4]).children[2].children === 3,
			"h('div', [1,2], [3,4])"
		);

		assert(
			h('div', {title: 'foo'}).props.title === 'foo',
			"h('div', {title: 'foo'})"
		);

		assert(
			h('div', h('h1', 1)).children[0].children[0].children === 1 &&
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

	describe('dio.stream', function(assert, done) {
		var foo = dio.stream(3);
		var bar = dio.stream(2);
		var faz = dio.stream('string');
		var pro = dio.stream('100', Number);
		var the = dio.stream('initial');
		var spye = spy();

		var fooMap = foo.map(function (value) {
			return value + 10;
		});

		var fn = spy();

		the.then(function () {
			fn();
			assert(fn.called, 'stream.then()');
			done();
		});

		the('changed');

		foo(2);
		
	    assert(foo() + bar() === 4, '.stream()');
	    assert(pro() === 100, '.stream(__, processor)');
	    assert(fooMap() === 12, 'stream.map()' );
	});

	describe('dio.renderToString', function (assert) {
		var hyperscript = h('div', {class: 'foo' }, 'hello world');

		var component = dio.createClass({
			render: function () {
				return hyperscript;
			}
		});

		var expectedOutput = '<div class="foo">hello world</div>';

		var hyperscriptHTML = dio.renderToString(hyperscript).replace(/\n|\t+/g, '');
		var componentHTML   = dio.renderToString(component).replace(/\n|\t+/g, '');

		assert(hyperscriptHTML === expectedOutput, '.renderToString(hyperscript)');
		assert(componentHTML   === expectedOutput, '.renderToString(createClass)');
	});

	describe('dio.defer', function (assert) {
		function fn (a, b) {
			return a + b;
		};

		var e = {
			preventDefault: spy()
		};

		function event () {}

		var simple = dio.defer(fn, [1, 2]);
		var evt = dio.defer(event, null, true);

		evt(e);

		assert(simple() === 3, '.defer(fn, [a, b])');
		assert(e.preventDefault.called, '.defer(fn, __, true)');
	});

	describe('dio.createClass', function (assert) {
		var hyperscript = h('div', {class: 'foo' }, 'hello world');

		function render () {
			return hyperscript
		}

		var obj = dio.createClass({
			render: render
		});

		var fn = dio.createClass(function () {
			return {
				render: render
			};
		});

		function isComponent (a) {
			a = new a;

			var props = [
				'withAttr', 'setState', 'setProps', 
				'forceUpdate', 'state', 'props', 'render'
			];

			var state = props.filter(function (value) {
				return !!a[value];
			});

			return !!state.length;
		}

		var fnC  = new fn;
		var objC = new obj;

		assert.deepEqual(fnC.render(), hyperscript, '.createClass({Object})');
		assert.deepEqual(objC.render(), hyperscript, '.createClass({Function})');
		assert.deepEqual(objC.render(), fnC.render(), isComponent(obj), '.createClass({Object}|{Function})');
		assert(isComponent(fn), '.createClass({Function})(__, __, true)');
		assert(isComponent(obj), '.createClass({Object})(__, __, true)');
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

	describe('dio.render', function (assert, done) {
		var container;

		if (typeof document === 'object') {
			container = document.querySelector('.container');
		}

		var hyperscript = h('pre', {style: 'display:none;'}, '.render works');

		var propsSpy = spy();
		var childrenSpy = spy();

		var render = dio.render({
			render: function () {
				if (this.props.id) {
					propsSpy();
				}

				return hyperscript;
			}
		}, container);

		if (container) {
			assert(container.children.length, '.render({Object}, element)');
		}

		if (typeof document === 'object') {
			setTimeout(function () {
				render({id: 2});
				assert(propsSpy.called, 'render(props)');
				done();
			}, 1000/61);
		} else {
			done();
		}
	});

	describe('dio.request', function (assert, done) {
		if (typeof XMLHttpRequest !== 'function') {
			return done();
		}

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

		dio.request.post('?', {id: 1234}, null, function () {
			assert(true, '(__, __, __, callback)');
		}).then(function (value) {
			assert(value.nodeType, '.post()')
		});
	});
});