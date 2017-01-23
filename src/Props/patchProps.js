/**
 * patch props
 * 
 * @param  {VNode} newNode
 * @param  {VNode} oldNode
 */
function patchProps (newNode, oldNode) {
	var newProps = newNode.props;
	var oldProps = oldNode.props;
	var namespace = newNode.props.xmlns || '';
	var target = oldNode.DOMNode;
	var length = 0;

	// diff newProps
	for (var newName in newNode.props) { 
		var newValue = newProps[newName];
		var oldValue = oldProps[newName];

		if (newValue != null && oldValue !== newValue) {
			updateProp(target, 'setAttribute', newName, newValue, namespace);
			
			if (length === 0) {
				length++;
			}
		}
	}

	// diff oldProps
	for (var oldName in oldNode.props) { 
		var newValue = newProps[oldName];

		if (newValue == null) {
			updateProp(target, 'removeAttribute', oldName, '', namespace);
			
			if (length === 0) {
				length++;
			}
		}
	}

	if (length !== 0) {
		oldNode.props = newNode.props;
	}
}

