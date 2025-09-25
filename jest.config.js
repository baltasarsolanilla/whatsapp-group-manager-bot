export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const testMatch = ['**/?(*.)+(spec|test).[jt]s?(x)'];
export const moduleFileExtensions = ['ts', 'js', 'json'];
export const moduleNameMapper = {
	'^@database/(.*)$': '<rootDir>/src/database/$1',
	'^@logic/(.*)$': '<rootDir>/src/logic/$1',
	'^@routes/(.*)$': '<rootDir>/src/routes/$1',
	'^@services/(.*)$': '<rootDir>/src/services/$1',
	'^@config$': '<rootDir>/src/config',
	'^@constants/(.*)$': '<rootDir>/src/constants/$1',
	'^@utils/(.*)$': '<rootDir>/src/utils/$1',
};
export const transform = {
	'^.+\\.(ts|tsx)$': ['ts-jest', {
		tsconfig: 'tsconfig.json',
	}],
};
export const collectCoverageFrom = [
	'src/database/**/*.ts',
	'!src/database/**/*.test.ts',
	'!src/database/**/*.spec.ts',
	'!src/database/__mocks__/**/*.ts',
];
export const coverageDirectory = 'coverage';
export const coverageReporters = ['text', 'lcov', 'html'];
