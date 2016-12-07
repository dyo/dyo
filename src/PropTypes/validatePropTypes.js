/**
 * validate prop types
 * 
 * @param  {Object} props       
 * @param  {Object} propTypes   
 * @param  {string} displayName
 */
function validatePropTypes (props, propTypes, displayName) {
	for (var propName in propTypes) {
		var typeValidator = propTypes[propName];

		// execute validator
		var validationResult = typeValidator(props, propName, displayName,
			createInvalidPropTypeError, createRequiredPropTypeError
		);

		// an error has occured only if the validator returns a non-falsey value
		if (validationResult) {
			logValidationError(validationResult);
		}
	} 
}

