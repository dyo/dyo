/**
 * primitive type validator
 * 
 * @param  {*} propValue
 * @param  {*} expectedType
 * @return {boolean|undefined}
 */
function primitiveTypeValidator (propValue, expectedType) {
	// if it's not of the valid type
	if (isValidPropType(propValue, expectedType) === false) {
		return 1;
	}
}

