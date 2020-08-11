const path = require('path')

module.exports = {
	...require('../../jest.config'),
	testEnvironment: 'node',
	notify: true,
	notifyMode: 'always',
	roots: [
		'<rootDir>',
	],
	globals: {
		'ts-jest': {
			tsConfig: '<rootDir>/tsconfig.json',
		},
	},
	setupFilesAfterEnv: [path.join(__dirname, '../jest/setupTests.ts')],
}
