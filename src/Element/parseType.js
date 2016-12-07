/**
 * special virtual element types
 *
 * @example h('inpu#id[type=radio]') <-- yields --> h('input', {id: 'id', type: 'radio'})
 *
 * @param  {Object} type
 * @param  {Object} props
 * @param  {Object} element
 */
function parseType (type, props, element) {
	var matches;
	var regEx;
	var classList = [];

	// default type
	element.type = 'div';

	// if undefined, create and cache RegExp
	if (parseVNodeType.regEx === void 0) {
		regEx = parseVNodeType.regEx = new RegExp(
			'(?:(^|#|\\.)([^#\\.\\[\\]]+))|(\\[(.+?)(?:\\s*=\\s*(\"|\'|)((?:\\\\[\"\'\\]]|.)*?)\\5)?\\])',
			'g'
		);
	} else {
		regEx = parseVNodeType.regEx;
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
			element.type = valueMatch;
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
	element.props = props;
}