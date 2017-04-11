/**
 * Resolve Promises
 *
 * @param {Promise} pending
 * @param {Component} owner
 */
function resolve (pending, owner) {
	var tree = owner._tree;

	if (tree === null) {
		tree = text('');
	}

	owner._block = 1;

	pending.then(function (value) {
		var status = value.status;

		if (
			value !== void 0 &&
			value !== null &&
			status !== void 0
		) {
			if (status >= 200 && status < 400) {
				value.text().then(function (source) {
					var addrs = value.url;
					var cache = owner._cache === void 0 ? (owner._cache = {}) : owner._cache;
					var store = cache[addrs];
					var older;
					var result;

					if (store !== void 0) {
						older = store.src;
						result = store.res;
					}

					if (older !== source) {
						result = addrs.lastIndexOf('.js') > addrs.length - 4 ? module(source, owner, addrs) : source;
						cache[addrs] = {src: source, res: result};
					}

					refresh(result, owner);
				});
			} else {
				refresh(tree, owner);
			}
		} else {
			refresh(value, owner);
		}
	});

	return tree;
}

/**
 * Refresh Module
 *
 * @param {Any}
 * @param {Component}
 */
function refresh (source, owner) {
	var older = owner._tree;
	var newer = shape(source, owner, false);

	owner._block = 0;

	if (older === null) {
		return;
	}

	if (older.tag !== newer.tag) {
		swap(older, newer, false);
	} else {
		patch(older, newer, 0);
	}
}

/**
 * Extract Module
 *
 * @param  {String} source
 * @param  {Component} owner
 * @return {Function}
 */
function module (source, owner, addrs) {
	try {
		return new Function('"use strict";' + format(source)).call(global);
	} catch (err) {
		errorBoundary(err instanceof Error ? err.stack : err, owner, 6, addrs);
	}
}

/**
 * Format Source
 *
 * @param  {String} source
 * @return {String}
 */
function format (source) {
	return source.replace(/^[\t ]*export[\t ]+(?:default[\t ]|)/gm, 'return ');
}
