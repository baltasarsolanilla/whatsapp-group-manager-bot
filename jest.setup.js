// Global test setup for mocking Prisma client
import mockPrisma from '../src/database/__mocks__/prisma';

// Mock @prisma/client globally
jest.mock('@prisma/client', () => ({
	PrismaClient: jest.fn(() => mockPrisma),
	// Mock the types
	Blacklist: {},
	Group: {},
	User: {},
	Whitelist: {},
	GroupMembership: {},
	RemovalQueue: {},
	Message: {},
	RemovalHistory: {},
	WebhookEvent: {},
	RemovalOutcome: {
		SUCCESS: 'SUCCESS',
		FAILURE: 'FAILURE'
	},
	Prisma: {
		WebhookEventCreateInput: {}
	}
}));

// Mock @database/prisma globally
jest.mock('./src/database/prisma', () => mockPrisma, { virtual: true });