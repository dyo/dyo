/**
 * type validator factory
 * 
 * @param  {*}         expectedType
 * @param  {boolean}   isRequired
 * @param  {function=} validator
 * @return {function}
 */
function createTypeValidator (expectedType, isRequired, validator) {
	validator = validator || primitiveTypeValidator;

	function typeValidator (props, propName, displayName) {
		var propValue = props[propName];

		displayName = displayName || '#unknown';

		if (propValue != null) {
			if (validator(propValue, expectedType, props, propName, displayName) === 1) {
				return createInvalidPropTypeError(
					propName, propValue, displayName,  expectedType
				);
			}
		} else if (isRequired === 1) {
			// if required prop i.e propTypes.bool.isRequired
			return createRequiredPropTypeError(propName, displayName);
		}
	}

	// assign .isRequired
	if (isRequired !== 1) {
		typeValidator.isRequired = createTypeValidator(expectedType, 1, validator);
	}

	return (typeValidator._propType = expectedType, typeValidator);
}

