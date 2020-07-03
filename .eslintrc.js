module.exports = {
	parser: '@typescript-eslint/parser',
	// https://eslint.org/docs/user-guide/configuring#specifying-parser-options
	parserOptions: {
		// https://eslint.org/docs/user-guide/migrating-to-5.0.0#experimental-object-rest-spread
		ecmaVersion: 2018,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
			impliedStrict: true,
		},
		typescript: true,
	},
	env: {
		node: true,
		es6: true,
		'jest/globals': true,
	},
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			typescript: {},
		},
	},
	extends: [
		'eslint:recommended',
		'standard',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:jest/recommended',
		'plugin:import/typescript',
		// 'plugin:prettier/recommended',
	],
	plugins: [
		'jest',
		'json',
		'lodash',
		'@typescript-eslint',
		'@angular-eslint/eslint-plugin',
	],
	rules: {
		'no-console': 'off',
		'no-tabs': 'off',
		quotes: ['warn', 'single'],
		indent: ['error', 'tab', { SwitchCase: 1, MemberExpression: 1 }],

		// Errors
		'brace-style': ['error', '1tbs', { allowSingleLine: false }],
		'comma-dangle': ['error', 'always-multiline'],
		curly: ['error', 'all'],
		'lines-between-class-members': ['off'],
		'no-trailing-spaces': ['error', { skipBlankLines: false }],
		'no-unused-vars': ['warn'], // TODO: change to error after fixing initial errors
		'padding-line-between-statements': [
			'error',
			{ blankLine: 'always', prev: '*', next: 'class' },
			{ blankLine: 'always', prev: '*', next: 'function' },
			{ blankLine: 'always', prev: '*', next: 'if' },
			{ blankLine: 'always', prev: '*', next: 'return' },
			{ blankLine: 'always', prev: 'directive', next: '*' },
			{ blankLine: 'any', prev: 'directive', next: 'directive' },
			{ blankLine: 'always', prev: ['import', 'cjs-import'], next: '*' },
			{
				blankLine: 'never',
				prev: ['import', 'cjs-import'],
				next: ['import', 'cjs-import'],
			},
		],
		'yield-star-spacing': ['error', 'after'],
		// TODO: change this to error after able to fix current issues
		'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],

		// Warnings
		'lodash/import-scope': ['warn', 'member'],
		'padded-blocks': 'warn',
		'generator-star-spacing': 'warn',
		'import/namespace': 'warn',
		'no-mixed-operators': 'warn',
		'max-len': [
			'warn',
			{
				code: 120,
				tabWidth: 1,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignoreRegExpLiterals: true,
				ignoreComments: false,
				ignoreTrailingComments: true,
				ignorePattern:
					'^\\s*((export\\s(default\\s)?)?function)|(@(param|example|returns)\\s+)',
			},
		],
		'standard/no-callback-literal': 'warn',
		// TODO: convert to error after fixing repo
		'no-useless-escape': 'warn',
		'no-throw-literal': 'warn',
		'no-return-assign': 'warn',

		'import/no-named-as-default': 'off',
		'no-new': 'off',
		'no-new-func': 'off',
		'no-template-curly-in-string': 'warn',

		'directive-selector': [true, 'attribute', 'app', 'camelCase'],
		'component-selector': [true, 'element', 'app', 'kebab-case'],

		// Typescript
		// https://github.com/typescript-eslint/typescript-eslint/blob/61c60dc047da680b8cc74943c52c33562942c95a/packages/eslint-plugin/src/configs/recommended.json
		'@typescript-eslint/adjacent-overload-signatures': 'error',
		'@typescript-eslint/array-type': 'error',
		'@typescript-eslint/ban-types': 'error',
		'@typescript-eslint/camelcase': 'error',
		'@typescript-eslint/class-name-casing': 'error',
		'@typescript-eslint/explicit-function-return-type': 'warn',
		'@typescript-eslint/explicit-member-accessibility': 'off',
		// 'indent': 'off',
		// '@typescript-eslint/indent': 'error',
		'@typescript-eslint/interface-name-prefix': 'error',
		'@typescript-eslint/member-delimiter-style': [
			'error',
			{
				multiline: {
					delimiter: 'none',
					requireLast: true,
				},
				singleline: {
					delimiter: 'comma',
					requireLast: true,
				},
			},
		],
		'@typescript-eslint/no-angle-bracket-type-assertion': 'error',
		'@typescript-eslint/no-array-constructor': 'error',
		'@typescript-eslint/no-empty-interface': 'warn',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-inferrable-types': 'error',
		'@typescript-eslint/no-misused-new': 'error',
		'@typescript-eslint/no-namespace': 'error',
		'@typescript-eslint/no-non-null-assertion': 'error',
		'@typescript-eslint/no-object-literal-type-assertion': 'error',
		'@typescript-eslint/no-parameter-properties': 'off',
		'@typescript-eslint/no-triple-slash-reference': 'error',
		'@typescript-eslint/no-unused-vars': ['warn'], // TODO: change to error after fixing
		'@typescript-eslint/no-use-before-define': [
			'error',
			{
				// `functions` and `typedefs` are hoisted and therefore safe
				functions: false,
				classes: true,
				variables: true,
				typedefs: false,
			},
		],
		'@typescript-eslint/no-var-requires': 'error',
		'@typescript-eslint/prefer-interface': 'error',
		'@typescript-eslint/prefer-namespace-keyword': 'error',
		'@typescript-eslint/type-annotation-spacing': 'error',
	},
	overrides: [
		{
			files: ['**/package.json'],
			rules: {
				indent: ['warn'],
			},
		},
		{
			files: ['**/*.ts', '**/*.tsx'],
			parser: '@typescript-eslint/parser',
			rules: {
				camelcase: 'off',
				'no-array-constructor': 'off',
				'no-unused-vars': 'off',
				// note you must disable the base rule as it can report incorrect errors
				'no-useless-constructor': 'off',
				'@typescript-eslint/no-useless-constructor': ['warn'],
			},
		},
		{
			files: ['**/*.js', '**/*.jsx'],
			rules: {
				'@typescript-eslint/camelcase': 'off',
				'@typescript-eslint/no-var-requires': 'off',
				'@typescript-eslint/no-unused-vars': 'off',
				'@typescript-eslint/no-use-before-define': 'off',
			},
		},
		{
			files: ['**/*.tsx'],
			rules: {
				'@typescript-eslint/explicit-function-return-type': 'off',
				'@typescript-eslint/explicit-member-accessibility': 'off',
				'@typescript-eslint/no-non-null-assertion': 'warn',
				'@typescript-eslint/no-namespace': 'warn',
			},
		},
		{
			files: ['**/*.spec.*', 'test/**/*'],
			rules: {
				'@typescript-eslint/explicit-function-return-type': 'off',
			},
		},
	],
}
