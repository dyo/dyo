/**
 * ---------------------------------------------------------------------------------
 * 
 * PropTypes
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * log validation errors
 * 
 * @param {string} error 
 */
function logValidationError (error) {
	console.error('Warning: Failed propType: ' + error + '`.');
	// this error is thrown as a convenience to trace the call stack
	sandbox(function () { panic(error); });
}


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


/**
 * create error message, required prop types
 * 
 * @param  {string} propName
 * @param  {string} displayName
 * @return {Error}
 */
function createRequiredPropTypeError (propName, displayName) {
	return panic(
		('Required prop `' + propName + '` not specified in `' +  displayName), 
		true
	);
}


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


/**
 * hash-maps (arrays/objects) validator factory 
 * 
 * @param  {string} type
 * @return {function}
 */
function createMapOfTypeValidator (type) {
	return function (validator) {
		var expectedTypeName = validator._propType + type;

		return createTypeValidator(expectedTypeName, 0,
			function (propValue, expectedType, props, propName, displayName) {
				// failed, exit early if not array
				if (!isArray(propValue)) {
					return 1;
				}

				var failed = 0;

				// check if every item in the array is of expectedType
				for (var i = 0, length = propValue.length; i < length; i++) {
					// failed, exit early
					if (validator(propValue, i, displayName)) {
						return failed = 1;
					}
				}

				return failed;
			}
		);
	};
}


/**
 * PropTypes constructor
 * 
 * @return {Object}
 */
function PropTypes () {
	var primitivesTypes = ['number', 'string', 'bool', 'array', 'object', 'func', 'symbol'];
	var propTypesObj    = {};

	// assign primitive validators
	for (var i = 0, length = primitivesTypes.length; i < length; i++) {
		var name = primitivesTypes[i];

		// bool / func ---> boolean / function
		var primitiveType = name === 'bool' ? name + 'ean'  :
							name === 'func' ? name + 'tion' : 
							name;

		// create, assign validator
		propTypesObj[name] = createTypeValidator(primitiveType);
	}

	// element
	propTypesObj.element = createTypeValidator('element', 0,
		function (propValue) {
			if (isValidElement(propValue) === false) {
				return 1;
			}
		}
	);

	// number, string, element ...or array of those
	propTypesObj.node = createTypeValidator('node', 0,
		function (propValue) {
			if (
				isString(propValue)       === false &&
				isNumber(propValue)       === false &&
				isValidElement(propValue) === false
			) {
				return 1;
			}
		}
	);

	// any defined data type
	propTypesObj.any = createTypeValidator('any', 0,
		function (propValue) {
			if (propValue != null) {
				return 1;
			}
		}
	);

	// instance of a constructor
	propTypesObj.instanceOf = function (Constructor) {
		var expectedTypeName = getDisplayName(Constructor);

		return createTypeValidator(expectedTypeName, 0,
			function (propValue, expectedType) {
				if (propValue && propValue.constructor !== Constructor) {
					return 1;
				}
			}
		);
	};

	// object of a certain shape
	propTypesObj.shape = function (shape) {
		var keys = Object.keys(shape);
		var length = keys.length;
		
		var expectedType = keys.map(function (name) { 
			return name + ': ' + shape[name]._propType; 
		});

		var expectedTypeName = '{\n\t' + expectedType.join(', \n\t') + '\n}';

		return createTypeValidator(expectedTypeName, 0,
			function (propValue, expectedType, props, propName, displayName) {
				// fail if propValue is not an object
				if (!isObject(propValue)) {
					return 1;
				}

				var propValueKeys = Object.keys(propValue);

				// fail if object has different number of keys
				if (propValueKeys.length !== length) {
					return 1;
				}

				var failed = 0;

				// check if object has the same keys
				for (var name in shape) {
					var validator = shape[name];

					// failed, exit
					if (!propValue[name] || validator(propValue, name, displayName)) {
						return failed = 1;
					}
				}

				return failed;
			}
		);
	};

	// limited to certain values
	propTypesObj.oneOf = function (values) {
		var expectedTypeName = values.join(' or ');

		return createTypeValidator(expectedTypeName, 0,
			function (propValue) {
				// default state
				var failed = 1;

				// if propValue is one of the values
				for (var i = 0, length = values.length; i < length; i++) {
					// passed, exit
					if (values[i] === propValue) {
						return failed = 0;
					}
				}

				return failed;
			}
		);
	};

	// limited to certain types
	propTypesObj.oneOfType = function (types) {
		var expectedTypeName = types.map(function (type) {
			return type._propType;
		}).join(' or ');

		return createTypeValidator(expectedTypeName, 0,
			function (propValue, expectedType, props, propName, displayName) {
				// default state
				var failed = 1;

				// if propValue is of one of the types
				for (var i = 0, length = types.length; i < length; i++) {
					if (!types[i](props, propName, displayName)) {
						return failed = 0;
					}
				}

				return failed;
			}
		);
	};

	// an array with values of a certain type
	propTypesObj.arrayOf = createMapOfTypeValidator('[]');
	// an object with property values of a certain type
	propTypesObj.objectOf = createMapOfTypeValidator('{}');

	return propTypesObj;
}