/**
 * check if a name is an event-like name, i.e onclick, onClick...
 * 
 * @param  {string}  name
 * @return {boolean}
 */
function isEventName (name) {
	return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 && name.length > 3;
}


/**
 * extract event name from prop
 * 
 * @param  {string} name
 * @return {string}
 */
function extractEventName (name) {
	return name.substring(2).toLowerCase();
}

