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

