/**
 * render props to string
 * 
 * @param  {VNode}  vnode
 * @return {string}
 */
function renderPropsToString (vnode) {
	var propsString = '';
	var props = vnode.props;

	// construct props string
	if (props !== objEmpty) {
		for (var name in props) {
			var value = props[name];

			// value --> <type name=value>, exclude props with undefined/null/false as values
			if (value != null && value !== false) {
				var type = typeof value;

				// props to avoid
				if (
					name !== 'key' && 
					name !== 'ref' && 
					name !== 'children' &&
					name !== 'innerHTML' &&
					name !== 'innerText' &&
					type !== 'function' &&
					isEventName(name) === false
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
						if (name === 'className') { 
							name = 'class'; 
						}

						// if falsey/truefy checkbox=true ---> <type checkbox>
						propsString += ' ' + (value === true ? name : name + '="' + value + '"');
					}
					// style objects
					else {
						var styles = '';

						for (name in value) {
							var property = value[name];

							// if camelCase convert to dash-case 
							// i.e marginTop --> margin-top
							if (name !== name.toLowerCase()) {
								name = name.replace(regStyleCamel, '$1-').replace(regStyleVendor, '-$1').toLowerCase();
							}

							styles += name + ':' + property + ';';
						}

						propsString += name + '="' + property + '"';
					}
				}
			}
		}
	}

	return propsString;
}

