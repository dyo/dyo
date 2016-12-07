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

