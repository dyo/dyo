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
	if (props !== objEmpty && props !== null) {
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
								name.replace(regStyleCamel, '$1-').replace(regStyleVendor, '-$1').toLowerCase();
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

