const mockPrisma = {
	blacklist: {
		upsert: jest.fn(),
		findMany: jest.fn(),
		deleteMany: jest.fn(),
	},
	group: {
		upsert: jest.fn(),
		findUnique: jest.fn(),
		update: jest.fn(),
	},
	user: {
		upsert: jest.fn(),
		findUnique: jest.fn(),
	},
	whitelist: {
		upsert: jest.fn(),
		findMany: jest.fn(),
		findUnique: jest.fn(),
		deleteMany: jest.fn(),
	},
	removalQueue: {
		upsert: jest.fn(),
		delete: jest.fn(),
		findMany: jest.fn(),
	},
	groupMembership: {
		upsert: jest.fn(),
		findMany: jest.fn(),
		delete: jest.fn(),
	},
	message: {
		upsert: jest.fn(),
	},
	removalHistory: {
		create: jest.fn(),
	},
	webhookEvent: {
		create: jest.fn(),
	},
};

export default mockPrisma;
