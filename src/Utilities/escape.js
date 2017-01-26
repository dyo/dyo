/**
 * escape string
 * 
 * @param  {(string|boolean|number)} subject
 * @return {string}
 */
function escape (subject) {
	return (''+subject).replace(regEsc, unicode);
}

