/**
 * do something after all dependecies have resolved
 * 
 * @param  {any[]}    deps
 * @return {(function)}
 */
stream.all = function (deps) {
	var resolved = [];

	// pushes a value to the resolved array and compares if resolved length
	// is equal to deps this will tell us when all dependencies have resolved
	function resolver (value, resolve) {
		resolved[resolved.length] = value;
		if (resolved.length === deps.length) {
			resolve(resolved)
		}
	}

	return stream(function (resolve, reject) {
		// check all dependencies, if a dependecy is a stream attach a listener
		// reject / resolve as nessessary.
		for (var i = 0, length = deps.length; i < length; i++) {
			var value = deps[i];

			if (value._stream) {
				value.then(function (value) { resolver(value, resolve); }).catch(function (reason) { reject(reason); });
			} else {
				resolver(value, resolve);
			}
		}
	});
};

