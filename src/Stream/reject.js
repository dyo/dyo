/**
 * create new stream in rejected state
 * 
 * @param  {*}    value 
 * @return {Stream}
 */
stream.reject = function (value) {
	return stream(function (resolve, reject) {
		reject(value);
	});
};

