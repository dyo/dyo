(function () {
	'use strict';

	test('hyperscript', function (ok, eq, spy, end) {
		ok(
			h('div').type === 'div', 
			"h('div')"
		);

		ok(
			h('.class').type === 'div' && 
			h('.class').props.class === 'class', 
			"h('.class')"
		);

		ok(
			h('#id').type === 'div' && 
			h('#id').props.id === 'id', 
			"h('#id')"
		);

		ok(
			h('[title=bar]').type === "div" &&
			h('[title=bar]').props.title === "bar" &&
			h('[title=\'bar\']').props.title === "bar" && 
			h('[title="bar"]').props.title === "bar", 
			"h('[title=bar]')"
		);

		ok(
			h('[checkbox]').props.checkbox === true,
			"h('[checkbox]')"
		);

		ok(
			h('div', 1).children[0] === '1',
			"h('div', 1)"
		);

		ok(
			h('div', 1, 2, 3).children[1] === '2',
			"h('div', 1)"
		);


		ok(
			h('div', [1]).children[0] === '1',
			"h('div', [1])"
		);

		ok(
			h('div', [1,2], 3).children[2] === '3',
			"h('div', [1,2], 3)"
		);

		ok(
			h('div', [1,2], [3,4]).children[2] === '3',
			"h('div', [1,2], [3,4])"
		);

		ok(
			h('div', {title: 'foo'}).props.title === 'foo',
			"h('div', {title: 'foo'})"
		);

		ok(
			h('div', h('h1', 1)).children[0].children[0] === '1' &&
			h('div', h('h1', 1)).children[0].type === 'h1',
			"h('div', h('h1', 1))"
		);

		ok(
			h('div', {class: ''}).props.className === undefined,
			"h('div', {class: ''})"
		);

		ok(
			h('div', {className: ''}).props.class === undefined,
			"h('div', {className: ''})"
		);

		end();
	});

	test('dio.createStream', function(ok, eq, spy, end) {
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
		
	    ok(foo() + bar() === 4, '.createStream()');
	    ok(pro() === 100, '.createStream(__, processor)');
	    ok(combine() === 4, '.createStream.combine()');
	    ok(fooMap() === 12, 'stream.map()' );
	    ok(fn.called, 'stream.then()');
	    ok(spye.called[1][0] === 2, '.combine(fn(a,b, prevValue))');

	    end();
	});

	test('dio.createHTML', function (ok, eq, spy, end) {
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

		ok(hyperscriptHTML === expectedOutput, '.createHTML(hyperscript)');
		ok(renderHTML      === expectedOutput, '.createHTML(createRender)');
		ok(componentHTML   === expectedOutput, '.createHTML(createComponent)');

		end();
	});

	test('dio.curry', function (ok, eq, spy, end) {
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

		ok(simple() === 3, '.curry(fn, [a, b])');
		ok(e.preventDefault.called, '.curry(fn, __, true)');

		end();
	});

	test('dio.createComponent', function (ok, eq, spy, end) {
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

		ok(eq(fn(), hyperscript), '.createComponent({Object})');
		ok(eq(obj(), hyperscript), '.createComponent({Function})');
		ok(eq(obj(), fn()) && isComponent(obj), '.createComponent({Object}|{Function})');
		ok(isComponent(fn), '.createComponent({Function})(__, __, true)')
		ok(isComponent(obj), '.createComponent({Object})(__, __, true)')

		end();
	});

	test('dio.createStore', function (ok, eq, spy, end) {
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

		ok(isStore(store), '.createStore({Function})');
		ok(eq(store.getState(), {items: [1,2,3,4]}), 'store.getState()');

		store.dispatch({type: 'ADD', item: 10});

		ok(eq(store.getState(), {items: [1,2,3,4,10]}), 'store.dispatch({Object})');

		store.subscribe(subscribeSpy);
		store.dispatch({type: 'ADD', item: 14});

		ok(subscribeSpy.called, 'store.subscribe(fn)');

		store.connect(renderSpy);
		store.dispatch({type: 'ADD', item: 33});

		ok(renderSpy.called, 'store.connect({createRender})');

		end();
	});

	test('dio.createRender', function (ok, eq, spy, end) {
		var container = document.querySelector('.container');
		var hyperscript = h('pre', {style: 'display:none;'}, '.createRender works');

		var render = dio.createRender({
			render: function () {
				return hyperscript;
			}
		}, container);

		var getHScriptFromRender = render(null,null,'@@dio/COMPONENT');

		render();

		ok(container.children.length, '.createRender({Object}, element)');

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

		ok(container.children.length, '.createRender({Object}, selector)');
		ok(container.children.length, 'render()');
		ok(propsSpy.called, 'render(props, __)');
		ok(childrenSpy.called, 'render(__, children)');
		ok(eq(getHScriptFromRender, hyperscript), "render(__, __, '@@dio')");
		
		end();
	});

	test('dio.request', function (ok, eq, spy, end) {
		var spyer = spy();
		var requestJSON = dio.request.get('https://jsonplaceholder.typicode.com/users');

		requestJSON.then(spyer).then(function (value) {
			ok(true, '.get()');
			ok(true, '.then()');
			ok(value.length === spyer.called[0][0].length, '.get(CORS)');

			throw 'error';
		}).catch(function (e) {
			ok(e === 'error', '.catch(e => e)');
			// a request would naturally take the longest
			// lets end the test here.
			end();
		});


		dio.request.post('./index.html', {id: 1234}, null, function () {
			ok(true, '(__, __, __, callback)');
		}).then(function (value) {
			ok(value.nodeType, '.post()')
		});
	});

	test('dio.createStyle', function (ok, eq, spy, end) {
		var style = {
			h1: {
				color: 'red',
				span: {
					color: 'blue'
				}
			}
		};
		var expectedOutput = '<style> h1 {color: red;} h1 span {color: blue;}</style>';
		var expectedNSOutput = '<style data-id=#ns>#ns h1 {color: red;}#ns h1 span {color: blue;}</style>';

		var stylesheet = dio.createStyle(style, null, true).replace(/\t|\n+/g, '');
		var stylesheetNS = dio.createStyle(style, '#ns', true).replace(/\t|\n+/g, '');

		ok(stylesheet === expectedOutput, 'dio.createStyle(style)');
		ok(stylesheetNS === expectedNSOutput, 'dio.createStyle(style, namespace)');

		end();
	});
}());