/**
 * ---------------------------------------------------------------------------------
 * 
 * server-side (async)
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * renderToStream
 * 
 * @param  {(Object|function)} subject 
 * @return {Stream}
 */
function renderToStream (subject, template) {	
	return subject ? (
		new Stream(
			subject,
			template == null ? null : template.split('{{body}}')
		)
	) : Stream
}


/**
 * Stream
 * 
 * @param {(VNode|Component)} subject
 * @param {string=}           template
 */
function Stream (subject, template) {
	this.initial  = 0;
	this.lookup   = {};
	this.stack    = [];
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
		value: 'html'
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
				return stack.pop()(this);
			}

			var vnode = subject.nodeType === 2 ? extractVNode(subject) : subject;
			var nodeType = vnode.nodeType;

			var component = subject.type;
			var type = vnode.type;
			var props = vnode.props;
			var children = vnode.children;

			// text node
			if (nodeType === 3) {
				// convert string to buffer and send chunk
				this.push(escape(children));
			} else {
				var sprops = renderStylesheetToString(component, styles, renderPropsToString(props), lookup);

				if (isvoid[type]) {
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

							// for each _read if queue has middleware
							// middleware execution will take priority
							function middlware (stream) {
								// done, close html tag, delegate next middleware
								index === length ? 
									stream.push(closing) : 
									stream._pipe(children[index++], false, stack, styles, lookup);
							}

							// push opening tag
							this.push(opening);

							// push middlwares
							for (var i = 0; i < middlwares; i++) {
								stack[stack.length] = middlware;
							}
						}
					}
				}
			}
		}
	}
}) : oempty;

