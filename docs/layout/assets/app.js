// stateless components
function Content (props) {
	return {
		nodeType: 1,
		type: 'div',
		props: {
			className: 'content',
			innerHTML: props.html
		},
		children: []
	};
}

function TableOfContents (props) {
	return {
		nodeType: 1,
		type: 'div',
		props: {
			className: 'table-of-contents'
		},
		children: [
			{
				nodeType: 1,
				type: 'ul',
				props: {},
				children: props.nav.map(function (value) {
					return {
						nodeType: 1,
						type: 'li',
						props: {},
						children: [
							{
								nodeType: 1,
								type: 'a',
								props: {
									href: value.href,
									className: value.active ? 'active' : '',
									onClick: props.onClick
								},
								children: [
									{
										nodeType: 3,
										type: 'text',
										props: {},
										children: [value.text]
									}
								]
							}
						]
					}
				})
			}
		]
	}
}

function Header () {
	return {
		nodeType: 1,
		type: 'div',
		props: {
			className: 'wrap'
		},
		children: [
			{
				nodeType: 1,
				type: 'div',
				props: {
					className: 'logo'
				},
				children: [
					{
						nodeType: 1,
						type: 'a',
						props: {
							href: './',
							onClick: dio.curry(router.nav, ['/'], true)
						},
						children: [
							{
								nodeType: 1,
								type: 'img',
								props: {
									src: 'assets/logo.svg',
								},
								children: []
							}
						]
					}
				]
			},
			{
				nodeType: 1,
				type: 'div',
				props: {
					className: 'nav'
				},
				children: [
					{
						nodeType: 1,
						type: 'ul',
						props: {},
						children: [
							{
								nodeType: 1,
								type: 'li',
								props: {},
								children: [
									{
										nodeType: 1,
										type: 'a',
										props: {
											href: 'https://github.com/thysultan/dio.js'
										},
										children: [
											{
												nodeType: 3,
												type: 'text',
												props: {},
												children: ['Github']
											}
										]
									}
								]
							}
						]
					}
				]
			}
		]
	}
}


// state components
function Documentation () {
	var markdown = dio.stream();

	function rawMarkup () {
		return remarkable.render(markdown());
	}

	function getDocument (url, callback) {
		dio.request.get(url)
			.then(markdown)
			.then(callback)
			.catch(function () {
				markdown('# 404 | document not found');
				callback();
			});
	}

	function update (self) {
		return function () {
			self.setState({loading: false}, highlighter);
		}
	}

	function activateLink (self, href) {
		href = href || this.getAttribute('href');

		if (this.className === 'active') {
			return;
		}

		var nav = [];

		dio.forEach(self.state.nav, function (value) {
			var item = dio.assign({}, value, {active: value.href !== href ? false : true});
			nav.push(item);
		});

		hash = href.replace('../', '').replace('.md', '');
		self.setState({nav: nav, loading: true});

		getDocument(href, update(self));
		window.location.hash = hash;
	}

	return {
		getInitialState: function () {
			return {
				nav: [
					{text: 'Installation', href: '../installation.md'},
					{text: 'Getting Started', href: '../getting-started.md'},
					{text: 'Examples', href: '../examples.md'},
					{text: 'API Reference', href: '../api.md'},
					{text: 'Change Log', href: '../../CHANGELOG.md'}
				]
			}
		},
		componentWillReceiveProps: function (props) {
			activateLink(this, props.url);
		},
		render: function (props) {
			return {
				nodeType: 1,
				type: 'div',
				props: {
					className: 'documentation'+(this.state.loading ? '.loading' : ''),
				},
				children: [
					Content({html: rawMarkup()}),
					TableOfContents({
						nav: this.state.nav,
						onClick: dio.curry(activateLink, [this], true)
					})
				]
			}
		}
	}
}


function Welcome () {
	var rawMarkup   = dio.stream('');

	function Install (e) {
		var href = e.target.getAttribute('href');

		if (href) {
			router.nav(href.replace('.',''));
		}
	}

	return {
		componentWillMount: function () {
			var self = this;

			dio.request.get(this.props.url)
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
			return {
				nodeType: 1,
				type: 'div',
				props: {
					className: 'welcome',
					onClick: dio.curry(Install, [], true),
					innerHTML: rawMarkup()
				},
				children: []
			}
		}
	}
}

var remarkable = new Remarkable();
var routes = {
	'/': function () {
		dio.render({nodeType: 1, type: Welcome, props: {url: '../welcome.md'}, children: []}, '.container');
	},
	'/documentation': function () {
		var section = window.location.hash.toLowerCase().replace('#', '');

		section = section || 'installation';
		section = '../'+ section + '.md';
		dio.render({nodeType: 1, type: Documentation, props: {url: section}, children: []}, '.container');
	}
};
var router = dio.router(routes, '/docs/layout');

dio.render(Header, '.header');