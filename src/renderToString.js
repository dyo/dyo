/**
 * ---------------------------------------------------------------------------------
 * 
 * server-side
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * server side render
 * 
 * @param  {(Object|function)} subject
 * @param  {string}            template
 * @return {string}
 */
function renderToString (subject, template) {
	var store = [''];
	var vnode = retrieveVNode(subject);

	if (template) {
		var body = renderVNodeToString(vnode, store);
		var style = store[0]; 

		if (typeof template === 'string') {
			return template.replace('{{body}}', body).replace('{{style}}', style);
		} else {
			return template(body, style);
		}
	} else {
		return renderVNodeToString(vnode, null);
	}
}


/**
 * render a VNode to string
 * 
 * @param  {Object} subject
 * @param  {str[1]} store
 * @return {string}  
 */
function renderVNodeToString (subject, store) {
	var vnode = subject.nodeType === 2 ? extractVNode(subject) : subject;

	var nodeType  = vnode.nodeType;

	// textNode
	if (nodeType === 3) {
		return escape(vnode.children);
	}

	// references
	var component = subject.type;
	var type = vnode.type;
	var props = vnode.props;
	var children = vnode.children;

	var childrenStr = '';

	// construct children string
	if (children.length === 0) {
		childrenStr = '';
	} else {
		for (var i = 0, length = children.length; i < length; i++) {
			childrenStr += renderVNodeToString(children[i], store);
		}
	}

	var propsStr = renderStylesheetToString(component, renderPropsToString(props), store);

	if (nodeType === 11) {
		return childrenStr;
	} else if (isvoid[type]) {
		// <type ...props>
		return '<'+type+propsStr+'>';
	} else {
		// <type ...props>...children</type>
		return '<'+type+propsStr+'>'+childrenStr+'</'+type+'>';
	}
}


/**
 * render stylesheet to string
 * 
 * @param  {function}  component
 * @param  {string}    string   
 * @param  {string[1]} store    
 * @return {string}          
 */
function renderStylesheetToString (component, string, store) {
	// stylesheet
	if (store != null && component.stylesheet != null) {
		// this insures we only every create one 
		// stylesheet for every component with one
		if (component.css === undefined || component.css[0] !== '<') {
			store[0] += stylesheet(null, component);
		} else if (component.stylesheet === 0) {
			store[0] = component.css;
		}

		if (store[0] !== '') {
			string += ' '+nsstyle+'='+'"'+component.id+'"';
		}
	}

	return string;
}


/**
 * render props to string
 * 
 * @param  {Object} props
 * @param  {string} string
 * @return {string}
 */
function renderPropsToString (props) {
	var string = '';

	// construct props string
	if (props !== oempty && props !== null) {
		each(props, function (value, name) {
			// value --> <type name=value>, exclude props with undefined/null/false as values
			if (value != null && value !== false) {
				var type = typeof value;

				if (type === 'string' && value) {
					value = escape(value);
				}

				// do not process these props
				if (
					type !== 'function' &&
					name !== 'key' && 
					name !== 'ref' && 
					name !== 'textContent' && 
					name !== 'innerHTML'
				) {
					if (type !== 'object') {
						if (name === 'className') { 
							name = 'class'; 
						}

						// if falsey/truefy checkbox=true ---> <type checkbox>
						string += ' ' + (value === true ? name : name + '="' + value + '"');
					} else {
						// if style objects
						var style = '';

						each(value, function (value, name) {
							// if camelCase convert to dash-case 
							// i.e marginTop --> margin-top
							if (name !== name.toLowerCase()) {
								name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
							}

							style += name + ':' + value + ';';
						});

						string += name + '="' + value + '"';
					}
				}
			}
		});
	}

	return string;
}


/**
 * renderToStream
 * 
 * @param  {(Object|function)} subject 
 * @return {Stream}
 */
function renderToStream (subject) {
	var Readable = (
		document ? 
			function () { this.on = this.push = function () {}; } : 
			require('stream').Readable
	);

	function Stream (subject) {
		Readable.call(this);
	}

	Stream.prototype = Object.create(Readable.prototype, {
		_read: {
			value: function (size) {
				console.log(0, size);

				if (initial === 1 && stack.length === 0) {
			  		this.push(null);
				} else {
					initial = 1;
					this._pipe(subject, true);
				}
			}
		},
		_push: {
			value: function (string) {
				// convert string to buffer and send chunk
				this.push(Buffer.from(string, 'utf8'));
			}
		},
		_pipe: {
			value: function (vnode, flush) {
				// if there something pending in the stack
				// give that priority
				if (flush && stack.length) { 
					stack.pop()(this); return;
				}

				vnode = vnode.nodeType === 2 ? extractVNode(vnode) : vnode;
				
				var nodeType = vnode.nodeType;
				var type = vnode.type;
				var props = vnode.props;
				var children = vnode.children;

				// text node
				if (nodeType === 3) {
					// convert string to buffer and send chunk
					this._push(escape(vnode.children));
				} else {
					if (isvoid[type]) {
						// <type ...props>
						this._push('<'+type+renderPropsToString(props)+'>');
					} else {
						var opening = '';
						var closing = '';

						// fragments(11) do not have opening and closing tags
						if (nodeType !== 11) {
							// <type ...props>...children</type>
							opening += '<'+type+renderPropsToString(props)+'>';
							closing += '</'+type+'>';
						}

						var length = children.length;

						if (length === 0) {
							// no children, sync
							this._push(opening+closing);
						} else if (length === 1 && children[0].nodeType === 3) {
							// one text node child, sync
							this._push(opening+escape(children[0].children)+closing);
						} else {
							// has children, async
							// since we cannot know ahead of time the number of children
							// recursively down this nodes tree
							// it is better to split this operation 
							// into asynchronously added chunks of data
							var index = 0;
							var middlwares = length + 1;

							// for each _read if queue has middleware
							// middleware execution will take priority
							function middlware (ctx) {
								if (index === length) {
									// done, close html tag
									ctx._push(closing);
								} else {
									// delegate next middleware
									ctx._pipe(children[index++], false);
								}
							}

							// push middlwares
							for (var i = 0; i < middlwares; i++) {
								stack.push(middlware);
							}

							// initialize opening tag
							this._push(opening);
						}
					}
				}
			}
		}
	});
	
	subject = retrieveVNode(subject);

	var stack = [];
	var initial = 0;


	return new Stream(subject);
}


// var req = renderToStream(
// 	createElement('div', {id: 'foo'}, 
// 		1, 2, 3, 4, 
// 		createElement('h1', 'Hello World')
// 	)
// );

// const writable = require('fs').createWriteStream('file.txt');
// req.pipe(writable);

// var body = '';

// // Readable streams emit 'data' events once a listener is added
// req.on('data', (chunk) => {
//     body += chunk;
// });

// // the end event indicates that the entire body has been received
// req.on('end', () => {
//     console.log('done,', body);
// });