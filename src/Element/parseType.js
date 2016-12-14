/**
 * parse special virtual node types
 *
 * @example h('inpu#id[type=radio]') <-- yields --> h('input', {id: 'id', type: 'radio'})
 *
 * @param  {string} type
 * @param  {Object} props
 * @param  {VNode}  vnode
 */
function parseType (type, props, vnode) {
	var matches;
	var regEx;
	var classList = [];

	// default type
	vnode.type = 'div';

	// if undefined, create and cache RegExp
	if (parseType.regEx === void 0) {
		regEx = parseType.regEx = new RegExp(
			'(?:(^|#|\\.)([^#\\.\\[\\]]+))|(\\[(.+?)(?:\\s*=\\s*(\"|\'|)((?:\\\\[\"\'\\]]|.)*?)\\5)?\\])',
			'g'
		);
	} else {
		regEx = parseType.regEx;
	}

	// execute RegExp, iterate matches
	while (matches = regEx.exec(type)) {
		var typeMatch      = matches[1];
		var valueMatch     = matches[2];
		var propMatch      = matches[3];
		var propKeyMatch   = matches[4];
		var propValueMatch = matches[6];

		if (typeMatch === '' && valueMatch !== '') {
			// type
			vnode.type = valueMatch;
		} else if (typeMatch === '#') { 
			// id
			props.id = valueMatch;
		} else if (typeMatch === '.') { 
			// class(es)
			classList[classList.length] = valueMatch;
		} else if (propMatch[0] === '[') { 
			// attribute
			// remove `[`, `]`, `'` and `"` characters
			if (propValueMatch != null) {
				propValueMatch = propValueMatch.replace(/\\(["'])/g, '$1').replace(/\\\\/g, "\\");
			}

			if (propKeyMatch === 'class') {
				propKeyMatch = 'className';
			}

			// h('input[checked]') or h('input[checked=true]') yield {checked: true}
			props[propKeyMatch] = propValueMatch || true;
		}
	}

	// if there are classes in classList, create className prop member
	if (classList.length !== 0) {
		props.className = classList.join(' ');
	}

	// assign props
	vnode.props = props;
}

