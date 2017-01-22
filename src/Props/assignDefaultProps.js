/**
 * assign default props
 * 
 * @param  {Object<string, any>} defaultProps
 */
function assignDefaultProps (defaultProps, props) {
	for (var name in defaultProps) {
		props[name] = props[name] || defaultProps[name];
	}
}

