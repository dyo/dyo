const keys = [
	'render', 'memo', 'lazy', 'Suspense', 'Boundary', 'Portal', 'Context', 'Fragment', 'Children',
	'createElement', 'cloneElement', 'isValidElement', 'h',
	'useRef', 'useMemo', 'useCallback', 'useState', 'useReducer', 'useContext', 'useResource', 'useEffect', 'useLayout'
]

describe('Fixture', () => {
	it('should require dyo module', () => {
		assert.hasAllDeepKeys(require('dyo'), keys)
	})

	it('should require dyo server module', () => {
		assert.hasAllDeepKeys(require('dyo/server'), keys)
	})
})
