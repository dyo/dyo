/**
 * escape string
 * 
 * @param  {(string|boolean|number)} subject
 * @return {string}
 */
function escape (subject) {
	return String(subject).replace(regEsc, unicode);
}

