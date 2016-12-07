/**
 * PropTypes constructor
 * 
 * @return {Object}
 */
function createPropTypes () {
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

