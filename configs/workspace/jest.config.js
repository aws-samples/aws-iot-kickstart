module.exports = {
	...require('../../jest.config'),
	testEnvironment: 'node',
	moduleNameMapper: {
		'(@deathstar/(.+))$': [
			'<rootDir>/../../core/$2/src',
			'<rootDir>/../../core/$2',
			'<rootDir>/../../infra/$2/src',
			'<rootDir>/../../infra/$2',
			'<rootDir>/../../api/$2/src',
			'<rootDir>/../../api/$2',
			'<rootDir>/../../ui/$2/src',
			'<rootDir>/../../ui/$2',
			'<rootDir>/../../private/$2/src',
			'<rootDir>/../../private/$2',
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
