/**
 * create new stream in rejected state
 * 
 * @param  {*}     value 
 * @return {function}
 */
stream.reject = function (value) {
	return stream(function (resolve, reject) {
		reject(value);
	});
};

