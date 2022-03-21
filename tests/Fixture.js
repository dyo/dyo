describe('Fixture', () => {
	it('should require dyo module', () => {
		assert.hasAllDeepKeys(require('dyo'), [
			'render', 'memo', 'lazy', 'Suspense', 'Boundary', 'Portal', 'Context', 'Fragment', 'Children',
			'createElement', 'cloneElement', 'isValidElement', 'h',
			'useRef', 'useMemo', 'useCallback', 'useState', 'useReducer', 'useContext', 'useResource', 'useEffect', 'useLayout'
		])
	})
})
