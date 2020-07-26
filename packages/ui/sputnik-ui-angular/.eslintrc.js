module.exports = {
	root: true,
	extends: '@deathstar/eslint-config',
	parserOptions: {
		project: './tsconfig.json',
	},
	plugins: [
		'@angular-eslint/eslint-plugin',
	],
	rules: {
		'import/no-unresolved': 'off',

		// TODO: remove these after resolving legacy formatting issues
		'padding-line-between-statements': 'warn',
		'no-prototype-builtins': 'warn',
		'accessor-pairs': 'warn',
		'handle-callback-err': 'warn',
		'prefer-const': 'warn',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-this-alias': 'warn',
		'@typescript-eslint/no-empty-function': 'warn',
		'@typescript-eslint/explicit-module-boundary-types': 'warn',
		'@typescript-eslint/no-use-before-define': 'off',
	}
}
