/**
 * check type validity
 * 
 * @param  {*}  propValue
 * @param  {*}  expectedType
 * @return {Boolean}
 */
function isValidPropType (propValue, expectedType) {
	// uppercase first letter, converts something like `function` to `Function`
	expectedType = (
		expectedType[0].toUpperCase() + expectedType.substr(1, expectedType.length)
	);

	// check if the propValue is of this type
	return (
		propValue != null && 
		propValue.constructor === window[expectedType]
	);
}

