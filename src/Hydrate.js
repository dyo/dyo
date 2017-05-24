/**
 * Hydrate
 *
 * @param {Tree} newer
 * @param {Tree} parent
 * @param {Number} index
 * @param {Node} _node
 * @param {Tree?} _host
 * @param {String?} _xmlns
 * @param {Boolean} entry
 * @return {Number}
 */
function hydrate (newer, parent, index, _node, _host, _xmlns, entry) {
	var flag = newer.flag;
	var group = newer.group;
	var node = _node;
	var host = _host;
	var xmlns = _xmlns;
	var i = 0;
	var temp;

	// link host
	if (host !== SHARED) {
		newer.host = host;
	}

	// link parent
	newer.parent = parent;

	// component
	if (group !== STRING) {
		if (group === CLASS) {
			host = newer;
		}

		temp = extract(newer, true);
		flag = temp.flag;
	}

	switch (flag) {
		// text
 		case TEXT: {
 			var children = parent.children;
 			var length = children.length;

 			if (length > 1 && children[index + 1].flag === TEXT) {
 				var fragment = new Tree(FRAGMENT);
 				var sibling = new Tree(TEXT);

 				fragment.node = createDocumentFragment();
 				sibling.node = node;

 				for (i = index; i < length; i++) {
 					var child = children[i];

 					if (child.flag !== TEXT) {
 						replaceChild(sibling, fragment, parent);
 						return i;
 					}

 					child.node = createTextNode(child.children);

 					appendChild(child, fragment);
 				}
 			} else {
 				if (node.nodeValue !== newer.children) {
 					node.nodeValue = newer.children;
 				}

 				newer.node = node;
 			}

 			return 0;
 		}
 		// composite
 		case COMPOSITE: {
 			hydrate(temp = temp.children[0], parent, index, node, host, xmlns);
 			newer.node = temp.node;

			return 0;
 		}
 		// portal
 		case PORTAL: {
 			create(newer, parent, SHARED, 0, host, xmlns);
 			break;
 		}
 		default: {
			var children = newer.children;
			var length = children.length;

			// cache namespace
			if (newer.xmlns !== null) {
				xmlns = newer.xmlns;
			} else if (xmlns !== null) {
				newer.xmlns = xmlns;
			}

 			// namespace(implicit) svg/math roots
 			switch (newer.tag) {
 				case 'svg': xmlns = svg; break;
 				case 'math': xmlns = math; break;
 			}

 			// whitespace
 			if (node.splitText !== void 0 && node.nodeValue.trim().length === 0) {
 				node = node.nextSibling;
 			}

 			newer.node = node;

 			if (length > 0) {
 				node = node.firstChild;

 				while (i < length && node !== null) {
 					var child = children[i];

 					if (child.node !== null) {
 						child = clone(children[i] = new Tree(child.flag), child, true);
 					}

 					var idx = hydrate(child, newer, i, node, host, xmlns);

 					if (idx !== 0) {
 						node = children[i = idx - 1].node;
 					}

 					node = node.nextSibling;
 					i++;
 				}
 			}
 		}
 	}

	attribute(newer, xmlns, true);

	return 0;
}
