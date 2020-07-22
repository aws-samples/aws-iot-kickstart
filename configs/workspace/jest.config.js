module.exports = {
	...require('../../jest.config'),
	testEnvironment: 'node',
	moduleNameMapper: {
		'(@deathstar/(.+))$': [
			'<rootDir>/../../$1/src',
			'<rootDir>/../../private/$2/src',
		],
	},
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
	setupFilesAfterEnv: ['<rootDir>/../../../configs/jest/setupTests.ts'],
}
