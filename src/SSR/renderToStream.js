/**
 * server-side render to stream
 * 
 * @param  {(VNode|Component)} subject 
 * @param  {string=}           template
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
	this.lookup   = {styles: '', ids: {}};
	this.template = template;
	this.node     = renderVNode(subject);

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
				var style = this.lookup.styles;

				// if there are styles, append
				if (style.length !== 0) {
					this.push('<style>'+style+'</style>');
				}

				// has template, push closing
				if (this.template) {
					this.push(this.template[1]);
				}

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
				this._pipe(this.node, true, this.stack, this.lookup);
			}
		}
	},
	_pipe: {
		value: function (subject, flush, stack, lookup) {
			// if there is something pending in the stack give that priority
			if (flush && stack.length !== 0) {
				stack.pop()(this); return;
			}

			var nodeType = subject.nodeType;

			// text node, sync
			if (nodeType === 3) {
				this.push(escape(subject.children)); return;
			}

			var vnode;

			// if component
			if (nodeType === 2) {
				// if cached
				if (subject.type._html !== void 0) {
					this.push(subject.type._html); return;
				} else {
					vnode = extractComponent(subject);
				}
			} else {
				vnode = subject;
			}

			// references
			var type     = vnode.type;
			var props    = vnode.props;
			var children = vnode.children;

			var propsStr = renderStylesheetToString(
				nodeType, subject._owner, subject.type, renderPropsToString(props), lookup
			);

			if (isVoid[type] === 0) {
				// <type ...props>
				this.push('<'+type+propsStr+'>');
			} else {
				var opening = '';
				var closing = '';

				// fragments do not have opening/closing tags
				if (vnode.nodeType !== 11) {
					// <type ...props>...children</type>
					opening = '<'+type+propsStr+'>';
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
						// this is operation is split into asynchronously added chunks of data
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
								if (eof && lookup.styles.length !== 0) {
									stream.push('<style>'+lookup.styles+'</style>');
									// clear styles, avoid adding duplicates
									lookup.styles = '';
								}

								stream.push(closing);
							} else {
								stream._pipe(children[index++], false, stack, lookup);
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

