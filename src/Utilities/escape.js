/**
 * escape string
 * 
 * @param  {(string|boolean|number)} subject
 * @return {string}
 */
function escape (subject) {
	return String(subject).replace(regEsc, unicoder);
}


/**
 * unicoder, escape => () helper
 * 
 * @param  {string} char
 * @return {string}
 */
function unicoder (char) {
	return uniCodes[char] || char;
}

