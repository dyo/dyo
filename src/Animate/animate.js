/**
 * create animate interface
 * 
 * @return {Object<string, function>}
 */
function animate () {
	return {
		flip:       flip,
		transition: css('transition'),
		animation:  css('animation')
	};
}