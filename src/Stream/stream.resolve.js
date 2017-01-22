/**
 * create new stream in resolved state
 *
 * @public
 * 
 * @param  {*} value
 * @return {function}
 */
stream.resolve = function (value) {
	return stream(function (resolve, reject) {
		resolve(value);
	});
};

