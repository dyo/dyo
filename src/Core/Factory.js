function createFactory (config) {
	switch (typeof config) {
		case 'object':
			if (config !== null && !isValidElement(config))
				return factory(window, config, require)
		default:
			return createElement.bind(null, config)
	}
}
