/**
 * create new stream in resolved state
 * 
 * @param  {*}          value
 * @return {function}
 */
stream.resolve = function (value) {
	return stream(function (resolve, reject) {
		resolve(value);
	});
};

