const keys = [
	'render', 'memo', 'lazy', 'Suspense', 'Fragment', 'Children',
	'createContext', 'createElement', 'createPortal', 'cloneElement', 'isValidElement', 'h',
	'useRef', 'useMemo', 'useCallback', 'useState', 'useReducer', 'useContext', 'useEffect', 'useLayout', 'useBoundary'
]

describe('Fixture', () => {
	it('should require dyo module', () => {
		assert.hasAllDeepKeys(require('dyo'), keys)
	})

	it('should require dyo server module', () => {
		assert.hasAllDeepKeys(require('dyo/server'), keys)
	})
})
