/**
 * Hydrate
 *
 * @param {Tree} newer
 * @param {Tree} parent
 * @param {Number} index
 * @param {Node} _node
 * @param {Tree?} _host
 * @param {String?} _xmlns
 * @return {Number}
 */
function hydrate (newer, parent, index, _node, _host, _xmlns) {
	var flag = newer.flag;
	var group = newer.group;
	var node = _node;
	var host = _host;
	var xmlns = _xmlns;
	var temp;

	// cache host
	if (host !== SHARED) {
		newer.host = host;
	}

	// cache parent
	newer.parent = parent;

	// component
	if (group !== STRING) {
		if (group === CLASS) {
			host = newer;
		}

		temp = extract(newer, true);
		flag = temp.flag;
	}

	// whitespace
	if (flag !== COMPOSITE) {
		if (node !== null && node.nodeType === 3 && node.nodeValue.trim().length === 0) {
			SHARED.node = node;
			removeChild(SHARED, parent);
			SHARED.node = null;

			node = node.nextSibling;
		}
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

 				for (var i = index; i < length; i++) {
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

 			newer.node = node;

 			if (length > 0) {
 				for (var i = 0, idx = 0; i < length; i++) {
 					var child = children[i];

 					// hoisted
 					if (child.node !== null) {
 						child = clone(children[i] = new Tree(child.flag), child, true);
 					}

 					node = i === 0 ? node.firstChild : node.nextSibling;

 					if ((idx = hydrate(child, newer, i, node, host, xmlns)) !== 0) {
 						node = children[(i = idx - 1)].node;
 					}
 				}
 			}
 		}
 	}

	attribute(newer, xmlns, true);

	return 0;
}
