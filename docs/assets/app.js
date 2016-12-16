(function () {
	// stateless components
	function Content (props) {
		return h('div', {className: 'content',innerHTML: props.html})
	}

	function TableOfContents (props) {
		return (
			h('div', {className: 'table-of-contents'}, 
				h('ul', 
					props.nav.map(function (value) {
						return h('li', 
							h('a', {href: value.href, className: value.active ? 'active' : '', onClick: props.onClick}, value.text)
						)
					})
				)
			)
		);
	}

	function Header () {
		return (
			h('div', {className: 'wrap'}, 
				h('div', {className: 'logo'}, 
					h('a', {className: './', onClick: router.link('/')},
						h('img', {src: 'assets/logo.svg'})
					)
				),
				h('div', {className: 'nav'}, 
					h('ul', 
						h('li',
							h('a', {href: 'https://github.com/thysultan/dio.js'}, 'Github')
						)
					)
				)
			)
		);
	}


	// state components
	function Documentation () {
		var markdown = dio.stream();

		function rawMarkup () {
			return md(markdown());
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

		function activateLink (context, e, href) {
			href = href || e.currentTarget.getAttribute('href');

			if (this.className === 'active') {
				return;
			}

			var nav = [];

			context.state.nav.forEach(function (value) {
				var item = Object.assign({}, value, {active: value.href !== href ? false : true});
				nav[nav.length] = item;
			});

			hash = href.replace('../', '').replace('.md', '');
			context.setState({nav: nav, loading: true});

			getDocument(href, update(context));
			window.location.hash = hash;
		}

		return {
			getInitialState: function () {
				return {
					nav: [
						{text: 'Installation', href: 'installation.md'},
						{text: 'API Reference', href: 'api.md'},
						{text: 'Examples', href: 'examples.md'},
						{text: 'Change Log', href: 'change-log.md'}
					]
				}
			},
			componentDidMount: function (props) {
				activateLink(this, null, this.props.url);
			},
			render: function (props) {
				return h('div', {className: 'documentation'+(this.state.loading ? '.loading' : '')},
					Content({html: rawMarkup()}),
					TableOfContents({
						nav: this.state.nav,
						onClick: {
							bind: activateLink,
							with: this
						}
					})
				);
			}
		}
	}


	function Welcome () {
		var rawMarkup   = dio.stream('');

		function Install (e) {
			var href = e.target.getAttribute('href');

			if (href) {
				router.location = href.replace('.','');
			}
		}

		return {
			componentWillMount: function () {
				var self = this;

				dio.request.get(this.props.url)
					.then(rawMarkup)
					.then(function () {
						rawMarkup(md(rawMarkup()))
						self.forceUpdate();
					});
			},
			componentDidUpdate: function () {
				highlighter();
			},
			render: function () {
				return h('div', {
					className: 'welcome', 
					onClick: Install,
					innerHTML: rawMarkup()
				})
			}
		}
	}


	var routes = {
		'/': function () {
			dio.render(h(Welcome, {url: 'welcome.md'}), '.container');
		},
		'/#*': function () {
			var section = window.location.hash.toLowerCase().replace('#', '');

			section = section || 'installation';
			section = ''+ section + '.md';
			dio.render(h(Documentation, {url: section}), '.container');
		}
	};
	var router = dio.router(routes);

	dio.render(Header(), '.header');
})()