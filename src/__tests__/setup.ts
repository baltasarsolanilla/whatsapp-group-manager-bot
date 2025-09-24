// Test setup file for global configurations and mocks
import { mockDeep } from 'jest-mock-extended';

// Mock Prisma client globally - using the actual import path
jest.mock('@database/prisma', () => ({
	default: mockDeep(),
}));

// Mock all logic services to prevent compilation errors
jest.mock('@logic/services', () => ({
	messageService: {
		ensureGroupMessageUpsert: jest.fn(),
	},
	webhookEventService: {
		storeEvent: jest.fn(),
	},
	whitelistService: {
		add: jest.fn(),
		remove: jest.fn(),
		list: jest.fn(),
	},
	blacklistService: {
		add: jest.fn(),
		remove: jest.fn(),
		list: jest.fn(),
	},
	removalQueueService: {
		list: jest.fn(),
		runQueue: jest.fn(),
		syncQueue: jest.fn(),
	},
	removalWorkflowService: {
		runWorkflow: jest.fn(),
	},
	groupService: {
		ingest: jest.fn(),
		update: jest.fn(),
		ensure: jest.fn(),
	},
	groupMembershipService: {
		findInactiveMembers: jest.fn(),
	},
}));

// Mock all database repositories to prevent compilation errors
jest.mock('@database/repositories', () => ({
	userRepository: {
		upsert: jest.fn(),
		findById: jest.fn(),
		findByWhatsappId: jest.fn(),
	},
	groupRepository: {
		upsert: jest.fn(),
		findById: jest.fn(),
		findByWhatsappId: jest.fn(),
	},
	messageRepository: {
		add: jest.fn(),
		findByWhatsappId: jest.fn(),
	},
	groupMembershipRepository: {
		upsert: jest.fn(),
		findInactiveMembers: jest.fn(),
	},
	whitelistRepository: {
		upsert: jest.fn(),
		remove: jest.fn(),
		list: jest.fn(),
	},
	blacklistRepository: {
		add: jest.fn(),
		remove: jest.fn(),
		list: jest.fn(),
	},
	removalQueueRepository: {
		add: jest.fn(),
		list: jest.fn(),
		remove: jest.fn(),
	},
	webhookEventRepository: {
		add: jest.fn(),
		findByEvent: jest.fn(),
	},
	removalHistoryRepository: {
		add: jest.fn(),
		findByUser: jest.fn(),
	},
}));

// Mock config globally
jest.mock('@config', () => ({
	default: {
		port: 3000,
		evolutionApiUrl: 'http://localhost:8080',
		evolutionApiKey: 'test-api-key',
		instance: 'test-instance',
		waVickyNum: '1234567890',
		waVickyId: '1234567890@s.whatsapp.net',
		waGroupTest: '1234567890-1234567890@g.us',
	},
}));

// Mock external HTTP calls
jest.mock('axios');

// Console mock to reduce noise in tests
const originalConsole = global.console;
global.console = {
	...originalConsole,
	log: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
	info: jest.fn(),
};

// Cleanup after each test
afterEach(() => {
	jest.clearAllMocks();
});