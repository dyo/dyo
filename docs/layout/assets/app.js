(function () {
	var component = dio.VComponent, curry = dio.curry;
	var dom = dio.DOM(['ul', 'li', 'div', 'a', 'img']);
	var div = dom.div, ul = dom.ul, li = dom.li, a = dom.a, img = dom.img, text = dom.text;

	// stateless components
	function Content (props) {
		return div({className: 'content',innerHTML: props.html})
	}

	function TableOfContents (props) {
		return div({className: 'table-of-contents'}, [
			ul(null, props.nav.map(function (value) {
				return li(null, [
					a({href: value.href, className: value.active ? 'active' : '', onClick: props.onClick}, [
						text(value.text)
					])
				])
			}))
		]);
	}

	function Header () {
		return div({className: 'wrap'}, [
			div({className: 'logo'}, [
				a({href: './', onClick: curry(router.nav, ['/'], true)}, [
					img({src: 'assets/logo.svg'})
				])
			]),
			div({className: 'nav'}, [
				ul(null, [
					li(null, [
						a({href: 'https://github.com/thysultan/dio.js'}, [text('Github')])
					])
				])
			])
		]);
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
				nav[nav.length] = item;
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
						{text: 'Change Log', href: '../change-log.md'}
					]
				}
			},
			componentWillReceiveProps: function (props) {
				activateLink(this, props.url);
			},
			render: function (props) {
				return div({className: 'documentation'+(this.state.loading ? '.loading' : '')}, [
					Content({html: rawMarkup()}),
					TableOfContents({
						nav: this.state.nav,
						onClick: dio.curry(activateLink, [this], true)
					})
				]);
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
				return div({className: 'welcome', onClick: curry(Install, [], true), innerHTML: rawMarkup()})
			}
		}
	}

	var remarkable = new Remarkable();
	var routes = {
		'/': function () {
			dio.render(component(Welcome, {url: '../welcome.md'}), '.container');
		},
		'/documentation': function () {
			var section = window.location.hash.toLowerCase().replace('#', '');

			section = section || 'installation';
			section = '../'+ section + '.md';
			dio.render(component(Documentation, {url: section}), '.container');
		}
	};
	var router = dio.router(routes, '/docs/layout');

	dio.render(Header, '.header');
})()