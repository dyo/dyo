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
	return subject ? (
		new Stream(subject, template == null ? null : template.split('@body'))
	) : function (subject) {
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
	this.initial  = true;
	this.stack    = [];
	this.lookup   = {styles: '', namespaces: {}};
	this.template = template;
	this.node     = renderVNode(subject);

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

			if (initial === false && this.stack.length === 0) {
				var styles = this.lookup.styles;

				// if there are styles, append
				if (styles.length !== 0) {
					this.push(styles);
				}

				// has template, push closing
				if (this.template) {
					this.push(this.template[1]);
				}

				// end of stream
				this.push(null);

				// reset `initial` identifier
				this.initial = true;			
			} else {
				// start of stream
				if (initial === true) {
					this.initial = false;

					// has template, push opening 
					this.template && this.push(this.template[0]);
				}

				// pipe a chunk
				this._pipe(this.node, true, this.stack, this.lookup, initial);
			}
		}
	},
	_pipe: {
		value: function (subject, flush, stack, lookup, initial) {
			// if there is something pending in the stack give that priority
			if (flush && stack.length !== 0) {
				stack.pop()(this); 
				return;
			}

			var nodeType = subject.nodeType;

			// text node, sync
			if (nodeType === 3) {
				this.push(escape(subject.children)); 
				return;
			}

			var vnode;

			// if component
			if (nodeType === 2) {
				// cached
				if (subject.type.HTMLCache !== void 0) {
					this.push(subject.type.HTMLCache); 
					return;
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
				nodeType, subject.instance, subject.type, renderPropsToString(props), lookup
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

						var doctype = initial && type === 'html';
						var eof = doctype || type === 'body';

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

