/**
 * create error message, invalid prop types
 * 
 * @param  {string} propName
 * @param  {*}      propValue
 * @param  {string} displayName
 * @param  {string} expectedType
 * @return {Error}
 */
function createInvalidPropTypeError (propName, propValue, displayName, expectedType) {
	return panic((
		'Invalid prop `' + propName + '` of type `' + 
		getDisplayName(propValue.constructor).toLowerCase() +
		'` supplied to `' + displayName + '`, expected `' + expectedType
	), true);
}

