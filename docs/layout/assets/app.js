function Header () {
	var
	header = dio.stream();

	return {
		componentWillMount: function () {
			var
			self = this;

			dio.request.get('header.md')
				.then(header)
				.then(function(){
					self.forceUpdate();
				});
		},
		render: function () {
			return h('div', {dangerouslySetInnerHTML: header() })
		}
	}
}

function Content () {
	var 
	markdown   = dio.stream(),
	remarkable = window.Remarkable ? new Remarkable() : function () {}

	function rawMarkup () {
		document.querySelector('.content').innerHTML = remarkable.render(markdown());
		highlighter('pre code');
	}

	return {
		componentWillReceiveProps: function (props) {
			dio.request.get(props.page)
				.then(markdown)
				.then(rawMarkup);
		},
		render: function () {
			return h('div', {dangerouslySetInnerHTML: rawMarkup() })
		}
	}
}

function TableOfContents () {
	return {
		onClick: function (e) {
			e.preventDefault();

			var
			element = e.currentTarget;
			href    = element.getAttribute('href'),
			nav     = [];

			this.props.nav.forEach(function (value) {
				var
				item = Object.assign({}, value, {active: value.href !== href ? false : true});
				nav.push(item);
			});

			this.setProps({nav: nav});
			this.forceUpdate();
			ContentRender({page: href});
		},
		render: function (props, _, self) {
			return h('ul',
						props.nav.map(function (value) {
							return h('li', 
								h('a[href='+ value.href +']', 
									{
										class: value.active ? 'active' : '',
										onClick: self.onClick
									},
									value.text
								)
							)
						})
					)
		}
	}
}

var
HeaderElement          = document.querySelector('.header'),
ContentElement         = document.querySelector('.content'),
TableOfContentsElement = document.querySelector('.table-of-contents');

var
HeaderRender = dio.createRender(Header, HeaderElement);

if (ContentElement && TableOfContentsElement) {
	ContentRender         = dio.createRender(Content, ContentElement);
	TableOfContentsRender = dio.createRender(TableOfContents, TableOfContentsElement);
}

HeaderRender();