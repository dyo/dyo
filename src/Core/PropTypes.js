/**
 * Determines the propTypes declaration of the component
 * 
 * @param {function} type Component class (constructor) or SFC function
 * @param {object} props Object of current component props
 * @returns {object|null} Object of validation functions per prop name,
 *                        or null if no propTypes are declared for the component
 */
function getPropTypes(type, props) {
  var propTypes = type[SharedPropTypes]

  if (typeof propTypes === 'function')
    propTypes = propTypes(props)

  return propTypes && typeof propTypes === 'object'
    ? propTypes
    : null
}

/**
 * Checks whether the props satisfy the propTypes declaration of the componet
 *
 * @param {function} type Component class (constructor) or (render) function
 * @param {object} props Object of current component props
 * @throws {any} will be thrown on validation error
 */
function checkPropTypes(type, props) {
  var propTypes = getPropTypes(type, props)

  if (propTypes) {
    var componentName = getDisplayName(type)

    for (var propName in propTypes) {
      var
        validator = propTypes[propName],
        result = validator(props, propName, componentName, 'prop', null)

      if (result instanceof Error) {
        throw result
      } else if (result === false) {
        throw new Error(`Invalid value for prop '${propName}' of '${componentName}'`)
      } else if (result && result !== true) {
        throw new Error(result)
      }
    }
  }
}
