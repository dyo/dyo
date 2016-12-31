/**
 * create new stream in rejected state
 *
 * @public
 * 
 * @param  {*} value 
 * @return {function}
 */
stream.reject = function (value) {
	return stream(function (resolve, reject) {
		reject(value);
	});
};

