const path = require('path')

module.exports = {
	clearMocks: true,
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'clover'],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
	globals: {
		'ts-jest': {
			extends: './tsconfig.json',
		},
	},
	moduleFileExtensions: ['ts', 'tsx', 'js'],
	modulePathIgnorePatterns: ['dist'],
	moduleNameMapper: {
		'@deathstar/(sputnik-([^-]+)(-.+)?)$': [
			path.join(__dirname, 'packages/$2/$1/src'),
			'$1',
		],
	},
	notify: true,
	notifyMode: 'always',
	roots: ['<rootDir>packages'],
	testMatch: ['**/__tests__/*.+(ts|tsx|js)', '**/*.(test|spec).+(ts|tsx|js)'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
	setupFilesAfterEnv: [path.join(__dirname, 'configs/jest/setupTests.ts')],
}
