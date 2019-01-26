/**
 * @param {object} element
 */
export function defs (element) {
	var ref = element.ref
	var len = ref.length

	if (len !== 0) {
		for (var i = 0, value = element.ref = []; i < len; i++) {
			if (value = ref[i]()) {
				if (element.parent === null && typeof value.then === 'function') {
					refs(element, value)
				}
			} else if (value === false) {
				refs(element, ref[i])
			}
		}
	}
}

/**
 * @param {object} element
 * @param {any?} value
 */
export function refs (element, value) {
	element.ref.push(value)
}
