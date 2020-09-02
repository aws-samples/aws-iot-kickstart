const defaults = require('@commitlint/config-conventional',)

module.exports = {
	extends: [
    '@commitlint/config-conventional',
  ],
  rules: {
		'type-enum': [
			2,
			'always',
      defaults.rules['type-enum'][2].concat(['wip']),
		],
  }
}
