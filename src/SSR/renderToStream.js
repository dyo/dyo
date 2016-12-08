/**
 * renderToStream
 * 
 * @param  {(Object|function)} subject 
 * @return {Stream}
 */
function renderToStream (subject, template) {	
	return subject ? (
		new Stream(subject, template == null ? null : template.split('@body'))
	) : function (subject) {
		return new Stream(subject);
	}
}


/**
 * Stream
 * 
 * @param {(VNode|Component)} subject
 * @param {string=}           template
 */
function Stream (subject, template) {
	this.initial  = 0;
	this.stack    = [];
	this.lookup   = {};
	this.styles   = [''];
	this.template = template;
	this.node     = retrieveVNode(subject);

	readable.call(this);
}


/**
 * Stream prototype
 * 
 * @type {Object}
 */
Stream.prototype = server ? Object.create(readable.prototype, {
	_type: {
		value: 'text/html'
	},
	_read: {
		value: function () {
			if (this.initial === 1 && this.stack.length === 0) {
				var style = this.styles[0];

				// if there are styles, append
				if (style.length !== 0) {
					this.push(style);
				}

				// has template, push closing
				this.template && this.push(this.template[1]);

				// end of stream
				this.push(null);

				// reset `initial` identifier
				this.initial = 0;			
			} else {
				// start of stream
				if (this.initial === 0) {
					this.initial = 1;

					// has template, push opening 
					this.template && this.push(this.template[0]);
				}

				// pipe a chunk
				this._pipe(this.node, true, this.stack, this.styles, this.lookup);
			}
		}
	},
	_pipe: {
		value: function (subject, flush, stack, styles, lookup) {
			// if there is something pending in the stack
			// give that priority
			if (flush && stack.length !== 0) {
				stack.pop()(this); return;
			}

			var nodeType = subject.nodeType;

			// text node
			if (nodeType === 3) {
				// convert string to buffer and send chunk
				this.push(escape(subject.children)); return;
			}

			var component = subject.type;
			var vnode;

			// if component
			if (nodeType === 2) {
				// if cached
				if (component._html !== void 0) {
					this.push(component._html); return;
				} else {
					vnode = extractVNode(subject);
				}
			} else {
				vnode = subject;
			}

			// references
			var type = vnode.type;
			var props = vnode.props;
			var children = vnode.children;

			var sprops = renderStylesheetToString(nodeType, component, styles, renderPropsToString(props), lookup);

			if (isVoid[type] === 0) {
				// <type ...props>
				this.push('<'+type+sprops+'>');
			} else {
				var opening = '';
				var closing = '';

				// fragments do not have opening/closing tags
				if (nodeType !== 11) {
					// <type ...props>...children</type>
					opening = '<'+type+sprops+'>';
					closing = '</'+type+'>';
				}

				if (props.innerHTML !== void 0) {
					// special case when a prop replaces children
					this.push(opening+props.innerHTML+closing);
				} else {
					var length = children.length;

					if (length === 0) {
						// no children, sync
						this.push(opening+closing);
					} else if (length === 1 && children[0].nodeType === 3) {
						// one text node child, sync
						this.push(opening+escape(children[0].children)+closing);
					} else {
						// has children, async
						// since we cannot know ahead of time the number of children
						// split this operation into asynchronously added chunks of data
						var index = 0;
						// add one more for the closing tag
						var middlwares = length + 1;

						var doctype = type === 'html';
						var eof = doctype || type === 'body';

						// for each _read if queue has middleware
						// middleware execution will take priority
						var middleware = function (stream) {
							// done, close html tag, delegate next middleware
							if (index === length) {
								// if the closing tag is body or html
								// we want to push the styles before we close them
								if (eof && styles[0].length !== 0) {
									stream.push(styles[0]);
									styles[0] = '';
								}

								stream.push(closing);
							} else {
								stream._pipe(children[index++], false, stack, styles, lookup);
							}
						}

						// if opening html tag, push doctype first
						if (doctype) {
							this.push('<!doctype html>');
						}

						// push opening tag
						this.push(opening);

						// push middlwares
						for (var i = 0; i < middlwares; i++) {
							stack[stack.length] = middleware;
						}
					}
				}
			}
		}
	}
}) : objEmpty;

