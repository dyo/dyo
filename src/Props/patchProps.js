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
	var updated = false;
	var length = 0;

	// diff newProps
	for (var newName in newNode.props) {
		length = newName.length;

		if (
			(length === 3 && newName === 'key') === false && 
			(length === 8 && newName === 'children') === false && 
			isEventProp(newName) === false
		) {
			var newValue = newProps[newName];
			var oldValue = oldProps[newName];

			if (newValue != null && oldValue !== newValue) {
				updateProp(target, true, newName, newValue, namespace);
				
				if (updated === false) {
					updated = true;
				}
			}
		}
	}

	// diff oldProps
	for (var oldName in oldNode.props) {
		length = oldName.length;

		if (
			(length === 3 && oldName === 'key') === false && 
			(length === 8 && oldName === 'children') === false &&  
			isEventProp(oldName) === false
		) {
			var newValue = newProps[oldName];

			if (newValue == null) {
				updateProp(target, false, oldName, '', namespace);
				
				if (updated === false) {
					updated = true;
				}
			}
		}
	}

	if (updated) {
		oldNode.props = newNode.props;
	}
}

