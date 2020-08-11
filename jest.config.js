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
	testEnvironment: 'node',
	globals: {
		'ts-jest': {
			extends: './tsconfig.json',
		},
	},
	moduleFileExtensions: ['ts', 'tsx', 'js'],
	modulePathIgnorePatterns: ['dist'],
	notify: true,
	notifyMode: 'always',
	roots: ['<rootDir>packages'],
	testMatch: ['**/__tests__/*.+(ts|tsx|js)', '**/*.(test|spec).+(ts|tsx|js)'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
	setupFilesAfterEnv: ['<rootDir>/configs/jest/setupTests.ts'],
}
