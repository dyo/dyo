/**
 * server-side render to stream
 *
 * @public
 * 
 * @param  {(VNode|Component|VNode[])} subject 
 * @param  {string=}                   template
 * @return {Stream}
 */
function renderToStream (subject, template) {	
	if (subject != null) {
		return new Stream(subject, template == null ? null : template.split('@body'));
	}
	else {
		return new Stream(subject);
	}
}


/**
 * Stream
 * 
 * @param {(VNode|Component|VNode[])} subject
 * @param {string=}                   template
 */
function Stream (subject, template) {
	if (server === false) {
		return renderToString(subject, template);
	}

	this.initial = true;
	this.stack = [];
	this.lookup = {styles: '', namespaces: {}};
	this.template = template;
	this.node = extractVirtualNode(subject, null);

	readable.call(this);
}


/**
 * Stream prototype
 * 
 * @type {Object<string, (function|string)>}
 */
Stream.prototype = server ? Object.create(readable.prototype, {
	_type: {
		value: 'text/html'
	},
	_read: {
		value: function () {
			var initial = this.initial;
			var template;
			var styles;
			var blob;

			if (initial === false && this.stack.length === 0) {
				styles = this.lookup.styles;
				template = this.template;
				blob = '';

				// styles?
				if (styles.length !== 0) {
					blob += styles;
				}

				// template?
				if (template !== null) {
					styles += template[1];
				}

				// reset `initial` identifier
				this.initial = true;

				// styles/template?
				if (blob.length !== 0) {
					this.push(blob);
				}

				// end of stream
				this.push(null);
			}
			else {
				// start of stream
				if (initial === true) {
					this.initial = false;

					// has template, push opening 
					if (template = this.template) {
						this.push(template[0]);
					}
				}

				// pipe a chunk
				this._pipe(
					this.node, 
					true, 
					this.stack, 
					this.lookup, 
					initial, 
					this
				);
			}
		}
	},
	_pipe: {
		value: function (subject, flush, stack, lookup, initial, self) {
			// if there is something pending in the stack give that priority
			if (flush && stack.length !== 0) {
				stack.pop()(this);
				
				return;
			}

			var nodeType = subject.Type;

			// text node, sync
			if (nodeType === 3) {
				this.push(escape(subject.children) || ' ');

				return;
			}

			var vnode;
			var component;
			var promise;

			// if component
			if (nodeType === 2) {
				// cached
				if (subject.type.HTMLCache !== void 0) {
					this.push(subject.type.HTMLCache);

					return;
				}
				// resolved async component
				else if (subject.instance !== null) {
					// render returned promise
					if (subject.DOMNode !== null) {
						vnode = subject.DOMNode;
					}
					// async getInitialProps
					else {
						vnode = extractRenderNode(subject.instance);
					}
				}
				else {
					vnode = extractComponentNode(subject, null, null);

					// pending async component
					if ((component = subject.instance)['--async'] !== false) {
						promise = component['--async'] !== true;

						(promise ? component['--async'] : component.props)
							.then(function resolveAsyncComponent (data) {								
								vnode.Type = 2;
								vnode.type = subject.type;
								vnode.instance = component;

								if (promise) {
									vnode.DOMNode = data;
								}
								else {
									component.props = data;
								}

								self._pipe(
									vnode,
									false, 
									stack, 
									lookup, 
									initial, 
									self
								);
							}).catch(funcEmpty);

						component['--async'] = false;

						return;
					}
				}
			}
			else {
				vnode = subject;
			}

			// references
			var type = vnode.type;
			var props = vnode.props;
			var children = vnode.children;

			var propsStr = renderStylesheetToString(
				nodeType, type, subject.instance, subject.type, renderPropsToString(vnode), lookup
			);

			if (isVoid[type] === 0) {
				// <type ...props>
				this.push('<'+type+propsStr+'>');

				return
			}

			var opening = '';
			var closing = '';

			if (props.innerHTML !== void 0) {
				// special case when a prop replaces children
				this.push(opening + props.innerHTML + closing);

				return;
			}

			var length = children.length;

			if (length === 0) {
				// no children, sync
				this.push(opening + closing);

				return;
			}
			if (length === 1 && children[0].Type === 3) {
				// one text node child, sync
				this.push(opening + escape(children[0].children) + closing);

				return;
			}

			// has children, async
			// since we cannot know ahead of time the number of children
			// this is operation is split into asynchronously added chunks of data
			var index = 0;

			// add one more for the closing tag
			var middlwares = length + 1;

			var doctype = initial && type === 'html';
			var eof = doctype || type === 'body';

			// if opening html tag, push doctype first
			if (doctype) {
				opening = '<!doctype html>' + opening;
			}

			// for each _read if queue has middleware
			// middleware execution will take priority
			var middleware = function (stream) {
				// done, close html tag, delegate next middleware
				if (index === length) {
					// if the closing tag is body or html
					// we want to push the styles before we close them
					if (eof && lookup.styles.length !== 0) {
						stream.push(lookup.styles);

						// clear styles, avoid adding duplicates
						lookup.styles = '';
					}

					stream.push(closing);
				}
				else {
					stream._pipe(
						children[index++], 
						false, 
						stack, 
						lookup, 
						initial, 
						self
					);
				}
			}

			// push middlwares
			for (var i = 0; i < middlwares; i++) {
				stack[stack.length] = middleware;
			}

			// push opening tag
			this.push(opening);
		}
	}
}) : objEmpty;
