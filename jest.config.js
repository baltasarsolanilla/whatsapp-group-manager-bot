export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const testMatch = ['**/?(*.)+(spec|test).[jt]s?(x)'];
export const moduleFileExtensions = ['ts', 'js', 'json'];
export const collectCoverageFrom = [
	'src/**/*.{ts,js}',
	'!src/**/*.d.ts',
	'!src/index.ts',
	'!src/config.ts',
	// Exclude database files that need Prisma types
	'!src/database/repositories/**',
	'!src/logic/services/groupMembershipService.ts',
	'!src/logic/services/groupService.ts',
	'!src/logic/services/removalQueueService.ts',
	'!src/logic/services/removalWorkflowService.ts',
	'!src/routes/groupController.ts',
];
export const coverageDirectory = 'coverage';
export const coverageReporters = ['text', 'lcov', 'html'];
export const setupFilesAfterEnv = ['<rootDir>/src/__tests__/setup.ts'];
export const modulePathIgnorePatterns = ['<rootDir>/dist/'];
export const moduleNameMapper = {
	'^@logic/(.*)$': '<rootDir>/src/logic/$1',
	'^@routes/(.*)$': '<rootDir>/src/routes/$1',
	'^@services/(.*)$': '<rootDir>/src/services/$1',
	'^@database/(.*)$': '<rootDir>/src/database/$1',
	'^@config$': '<rootDir>/src/config',
	'^@constants/(.*)$': '<rootDir>/src/constants/$1',
	'^@utils/(.*)$': '<rootDir>/src/utils/$1',
};
