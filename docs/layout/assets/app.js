// stateless components
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

function Header () {
	return h('.wrap', 
				h('.logo',
					h('a[href=./]', {onClick: dio.curry(router.nav, '/', true)}, h('img[src=assets/logo.svg]'))
				),
				h('.nav',
					h('ul', h('li', h('a[href=https://github.com/thysultan/dio.js]', 'Github')))
				)
			)
}


// state components
function Documentation () {
	var 
	markdown = dio.stream();

	function rawMarkup () {
		return remarkable.render(markdown());
	}

	function getDocument (url, callback) {
		dio.request.get(url)
			.then(markdown)
			.then(callback)
			.catch(function () {
				markdown('# 404 | document not found')
				callback()
			});
	}

	function update (self) {
		return function () {
			self.setProps({loading: false});
			self.forceUpdate();
			highlighter();
		}
	}

	function activateLink (self, href) {
		href = href || this.getAttribute('href');

		if (this.className === 'active') return;

		var
		nav = [];

		self.props.nav.forEach(function (value) {
			var
			item = Object.assign({}, value, {active: value.href !== href ? false : true});
			nav.push(item);
		});

		hash = href.replace('../', '').replace('.md', '');

		self.setProps({nav: nav, loading: true});
		self.forceUpdate();
		
		getDocument(href, update(self));
		window.location.hash = hash;
	}

	return {
		getDefaultProps: function () {
			return {
				nav: [
					{text: 'Installation', href: '../installation.md'},
					{text: 'Getting Started', href: '../getting-started.md'},
					{text: 'Examples', href: '../examples.md'},
					{text: 'API Reference', href: '../api.md'}
				]
			}
		},
		componentWillReceiveProps: function (props) {
			activateLink(this, props.url);
		},
		render: function (props) {
			return h('.documentation'+(props.loading ? '.loading' : ' '),
						Content({html: rawMarkup()}),
						TableOfContents({
							nav: props.nav,
							onClick: dio.curry(activateLink, this, true)
						})
					)
		}
	}
}


function Welcome () {
	var 
	rawMarkup   = dio.stream('');

	function Install (e) {
		var
		href = e.target.getAttribute('href');

		if (href) {
			router.nav(href.replace('.',''));
		}
	}

	return {
		componentDidMount: function (props, _, self) {
			dio.request.get(props.url)
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
				onClick: dio.curry(Install, true),
				dangerouslySetInnerHTML: rawMarkup()
			});
		}
	}
}

var
remarkable = new Remarkable();

var
router = dio.createRouter({
		'/': function () {
			dio.createRender(Welcome, '.container')({url: '../welcome.md'});
		},
		'/documentation': function () {
			var 
			section = window.location.hash.toLowerCase().replace('#', '');

			section = section || 'installation';
			section = '../'+ section + '.md';

			dio.createRender(Documentation, '.container')({url: section});
		}
	}, '/docs/layout');

dio.createRender(Header, '.header')();