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
      var validator = propTypes[propName]

      if (typeof validator !== 'function') {
        throw new Error(
          'Validator for propTypes.'
            + propName
            + ' of component '
            + componentName
            + ' must be a function')
      }

      var error = validator(props, propName, componentName, 'prop', null)

      if (error !== null) {
        if (error instanceof Error) {
          throw error
        } else {
          throw new Error(
            'Invalid return value for validator propTypes.'
              + propName
              + ' of component '
              + componentName
              + ', must either be null or an object of type Error')
        }
      }
    }
  }
}
