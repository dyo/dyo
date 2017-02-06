/**
 * render props to string
 * 
 * @param  {VNode}  vnode
 * @return {string}
 */
function renderPropsToString (vnode) {
	var string = '';
	var props = vnode.props;

	var length;
	var type;
	var value;
	var styles;
	var property;

	// construct props string
	if (props !== objEmpty) {
		for (var name in props) {
			value = props[name];

			// value --> <type name=value>, exclude props with undefined/null/false as values
			if (value != null && value !== false) {
				type = typeof value;
				length = name.length;

				// props to avoid
				if (
					(length === 3 && (name === 'key' || name === 'ref')) === false &&
					(length === 9 && name === 'children') === false &&
					(length === 9 && (name === 'innerHTML' && name === 'innerText')) === false &&
					(type.length === 8 && type === 'function') === false &&
					isEventProp(name) === false
				) {
					// defaultValue does not render
					if (name === 'defaultValue') {
						// if value does not already exist
						if (props.value === void 0) {
							name = 'value';
						}
						// else exist
						else {
							return;
						}
					}

					if (type === 'string' && value) {
						value = escape(value);
					}

					if (type !== 'object') {
						if (length === 9 && name === 'className') { 
							name = 'class'; 
						}

						// if falsey/truefy checkbox=true ---> <type checkbox>
						string += ' ' + (value === true ? name : name + '="' + value + '"');
					}
					// style objects
					else {
						styles = '';

						for (var name in value) {
							property = value[name];

							// if camelCase convert to dash-case 
							// i.e marginTop --> margin-top
							if (name !== name.toLowerCase()) {
								name = name.replace(regStyleCamel, '$1-').replace(regStyleVendor, '-$1').toLowerCase();
							}

							styles += name + ':' + property + ';';
						}

						string += name + '="' + property + '"';
					}
				}
			}
		}
	}

	return string;
}

