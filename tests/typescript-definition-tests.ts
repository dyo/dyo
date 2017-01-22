/// <reference path="../dio.d.ts" />

interface Props {
	something?: any;
}

var node = dio.createElement('div', {children: [h('h1')], something: true}, [
	dio.createElement('div', {
		onClick: {
			handler: (data, e) => {
				e.preventDefault();
			}
		},
		onDblClick: function (e) {
			e.preventDefault();
		}
	}, null)
]);

dio.h('div', null, null);

dio.render(node, document.createElement('div'), function (el) {
	el.nodeType;
});

dio.createClass({
	render (props) {
		return h('div');
	},
	state: {

	}
});

class Foo extends dio.Component<P> {
	constructor (props: any) {
		super(props);
	}
	render () {
		this.forceUpdate();
		return h('div');	
	}
}

dio.shallow(h('div'));
dio.shallow(Foo);

dio.renderToString([Foo]);
dio.renderToString(Foo, ``);
dio.renderToString(Foo, function () {});

dio.renderToStream(Foo);
dio.renderToStream([Foo]);
dio.renderToStream(Foo, ``);

dio.renderToCache([node]);
dio.renderToCache(node);
dio.renderToCache(Foo);

dio.version;

dio.createStore(function (state, action) {
	action.type;
});

dio.createStore(function (state, action) {
	action.type;
});

dio.applyMiddleware(
	function () {},
	function () {}
)

dio.combineReducers({
	a: function () {},
	b: function () {}
})

dio.request('?');
dio.request({url: '?'})
dio.request('', {}, 'json', 'json')
	.then(function (data: any) {})
	.catch(function (reason: any) {});

dio.isValidElement(node);
dio.cloneElement(node);
dio.cloneElement(node, {}, [1, 2]);
dio.createFactory('div')
dio.createFactory('div', {});

dio.DOM(['div']);

dio.VElement('div', null, null);
dio.VText('Hi');
dio.VComponent(Foo, null, null);
dio.VSvg('line', {}, null);

var strm = dio.stream(1);

strm.map;
strm.resolve;
strm.map;

dio.stream.reject;
dio.stream.resolve;

var router = dio.router({
	'/': function () {}
});

router.back;
router.destroy;
router.forward;
router.link;
router.navigate;
router.pause;
router.resolve;
router.resume;
router.set;
router.location;
router.routes;

