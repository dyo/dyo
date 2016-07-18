function Content (props) {
	return h('div.content', {dangerouslySetInnerHTML: props.html});
}

function TableOfContents (props) {
	return h('.table-of-contents',
				h('ul', 
					props.nav.map(function (value) {
						return h('li', 
									h('a[href='+ value.href +']', 
										{
											class: value.active ? 'active' : '',
											onClick: props.onClick
										},
										value.text
									)
								)
					})
				)
			)
}

function Documentation () {
	var 
	markdown   = dio.stream(),
	remarkable = window.Remarkable ? new Remarkable() : function () {}

	function rawMarkup () {
		return remarkable.render(markdown());
	}

	function getDocument (url, callback) {
		dio.request.get(url)
			.then(markdown)
			.then(callback);
	}

	function update (self) {
		return function () {
			self.forceUpdate();
			highlighter();
		}
	}

	function onClick (self) {
		return function (e) {
			e.preventDefault();

			var
			element = e.currentTarget;
			href    = element.getAttribute('href'),
			nav     = [];

			self.props.nav.forEach(function (value) {
				var
				item = Object.assign({}, value, {active: value.href !== href ? false : true});
				nav.push(item);
			});

			self.setProps({nav: nav});
			self.forceUpdate();
			getDocument(href, update(self));
		}
	}

	return {
		getDefaultProps: function () {
			return {
				nav: [
					{text: 'Installation', href: '../installation.md', active: true},
					{text: 'Getting Started', href: '../getting-started.md'},
					{text: 'Examples', href: '../examples.md'},
					{text: 'API Reference', href: '../api.md'}
				]
			}
		},
		componentWillReceiveProps: function (props) {
			getDocument(props.page, update(this));
		},
		render: function (props, _, self) {
			return h('.documentation',
						Content({html: rawMarkup()}),
						TableOfContents({
							nav: props.nav,
							onClick: onClick(self)
						})
					)
		}
	}
}

function Welcome () {
	var 
	rawMarkup = dio.stream('');

	function onClick (e) {
		e.preventDefault();

		var
		target = e.target,
		href   = target.href ? target.getAttribute('href') : void 0;
		
		if (href) {
			router.nav(href);
		}
	}

	return {
		componentDidMount: function (_, _, self) {
			console.log(arguments)
			dio.request.get('../welcome.md')
				.then(rawMarkup)
				.then(function () {
					rawMarkup(remarkable.render(rawMarkup()))
					self.forceUpdate();
				});
		},
		componentDidUpdate: function () {
			highlighter();
		},
		render: function () {
			return h('.welcome', {
				onClick: onClick,
				dangerouslySetInnerHTML: rawMarkup()
			});
		}
	}
}


var
remarkable = new Remarkable();

var
router = dio.createRouter({
	mount: '.app',
	root: '/docs/layout',
	routes: {
		'/': function () {
			dio.createRender(Welcome, '.container')();
		},
		'/documentation': function () {
			dio.createRender(Documentation, '.container')({page: '../installation.md'});
		}
	}
});