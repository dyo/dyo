/**
 * escape string
 * 
 * @param  {(string|boolean|number)} subject
 * @return {string}
 */
function escape (subject) {
	var string = subject + '';

	if (string.length > 50) {
		// use regex if the string is long
		return string.replace(regEsc, unicoder);
	} else {
		var characters = '';

		for (var i = 0, length = string.length; i < length; i++) {
			switch (string.charCodeAt(i)) {
				// & character
				case 38: characters += '&amp;'; break;
				// " character
				case 34: characters += '&quot;'; break;
				// ' character
				case 39: characters += '&#39;'; break;
				// < character
				case 60: characters += '&lt;'; break;
				// > character
				case 62: characters += '&gt;'; break;
				// any character
				default: characters += string[i]; break;
			}
		}
		
		return characters;
	}
}


/**
 * unicoder, escape => () helper
 * 
 * @param  {string} char
 * @return {string}
 */
function unicoder (char) {
	return uniCodes[char];
}

