// Mock the prisma module before imports
jest.mock('@database/prisma', () => ({
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
}));

import { messageRepository } from '@database/repositories/messageRepository';

const mockPrisma = require('@database/prisma');

describe('messageRepository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('add', () => {
		it('should add message successfully with all required data', async () => {
			const user = {
				id: 'user123',
				whatsappId: 'wa123@c.us',
				name: 'John Doe',
				whatsappPn: '+1234567890',
				createdAt: new Date(),
			};
			const group = {
				id: 'group456',
				whatsappId: 'group456@g.us',
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};
			const messageData = {
				user,
				group,
				whatsappId: 'msg123@wa',
				messageType: 'text',
				messageTimestamp: 1640995200, // Unix timestamp
			};
			const expectedDate = new Date(messageData.messageTimestamp * 1000);
			const mockMessage = {
				id: 'message1',
				whatsappId: messageData.whatsappId,
				userId: user.id,
				groupId: group.id,
				messageType: messageData.messageType,
				date: expectedDate,
				createdAt: new Date(),
			};

			mockPrisma.message.upsert.mockResolvedValue(mockMessage);

			const result = await messageRepository.add(messageData);

			expect(mockPrisma.message.upsert).toHaveBeenCalledWith({
				where: { whatsappId: messageData.whatsappId },
				update: {},
				create: {
					userId: user.id,
					groupId: group.id,
					whatsappId: messageData.whatsappId,
					messageType: messageData.messageType,
					date: expectedDate,
				},
			});
			expect(result).toEqual(mockMessage);
		});

		it('should handle different message types', async () => {
			const user = {
				id: 'user123',
				whatsappId: 'wa123@c.us',
				name: 'John Doe',
				whatsappPn: '+1234567890',
				createdAt: new Date(),
			};
			const group = {
				id: 'group456',
				whatsappId: 'group456@g.us',
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};

			const messageTypes = ['image', 'video', 'audio', 'document', 'sticker'];

			for (const messageType of messageTypes) {
				const messageData = {
					user,
					group,
					whatsappId: `msg-${messageType}@wa`,
					messageType,
					messageTimestamp: 1640995200,
				};
				const expectedDate = new Date(messageData.messageTimestamp * 1000);
				const mockMessage = {
					id: `message-${messageType}`,
					whatsappId: messageData.whatsappId,
					userId: user.id,
					groupId: group.id,
					messageType,
					date: expectedDate,
					createdAt: new Date(),
				};

				mockPrisma.message.upsert.mockResolvedValue(mockMessage);

				const result = await messageRepository.add(messageData);

				expect(mockPrisma.message.upsert).toHaveBeenCalledWith({
					where: { whatsappId: messageData.whatsappId },
					update: {},
					create: {
						userId: user.id,
						groupId: group.id,
						whatsappId: messageData.whatsappId,
						messageType,
						date: expectedDate,
					},
				});
				expect(result).toEqual(mockMessage);

				jest.clearAllMocks();
			}
		});

		it('should handle custom message types (string)', async () => {
			const user = {
				id: 'user123',
				whatsappId: 'wa123@c.us',
				name: 'John Doe',
				whatsappPn: '+1234567890',
				createdAt: new Date(),
			};
			const group = {
				id: 'group456',
				whatsappId: 'group456@g.us',
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};
			const messageData = {
				user,
				group,
				whatsappId: 'msg123@wa',
				messageType: 'custom_type',
				messageTimestamp: 1640995200,
			};
			const expectedDate = new Date(messageData.messageTimestamp * 1000);
			const mockMessage = {
				id: 'message1',
				whatsappId: messageData.whatsappId,
				userId: user.id,
				groupId: group.id,
				messageType: 'custom_type',
				date: expectedDate,
				createdAt: new Date(),
			};

			mockPrisma.message.upsert.mockResolvedValue(mockMessage);

			const result = await messageRepository.add(messageData);

			expect(mockPrisma.message.upsert).toHaveBeenCalledWith({
				where: { whatsappId: messageData.whatsappId },
				update: {},
				create: {
					userId: user.id,
					groupId: group.id,
					whatsappId: messageData.whatsappId,
					messageType: 'custom_type',
					date: expectedDate,
				},
			});
			expect(result).toEqual(mockMessage);
		});

		it('should handle existing message by doing no-op update', async () => {
			const user = {
				id: 'user123',
				whatsappId: 'wa123@c.us',
				name: 'John Doe',
				whatsappPn: '+1234567890',
				createdAt: new Date(),
			};
			const group = {
				id: 'group456',
				whatsappId: 'group456@g.us',
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};
			const messageData = {
				user,
				group,
				whatsappId: 'existing-msg@wa',
				messageType: 'text',
				messageTimestamp: 1640995200,
			};
			const existingMessage = {
				id: 'message1',
				whatsappId: messageData.whatsappId,
				userId: user.id,
				groupId: group.id,
				messageType: messageData.messageType,
				date: new Date(messageData.messageTimestamp * 1000),
				createdAt: new Date(2023, 0, 1), // Older creation date
			};

			mockPrisma.message.upsert.mockResolvedValue(existingMessage);

			const result = await messageRepository.add(messageData);

			expect(mockPrisma.message.upsert).toHaveBeenCalledWith({
				where: { whatsappId: messageData.whatsappId },
				update: {},
				create: {
					userId: user.id,
					groupId: group.id,
					whatsappId: messageData.whatsappId,
					messageType: messageData.messageType,
					date: new Date(messageData.messageTimestamp * 1000),
				},
			});
			expect(result).toEqual(existingMessage);
		});

		it('should handle timestamp conversion correctly', async () => {
			const user = {
				id: 'user123',
				whatsappId: 'wa123@c.us',
				name: 'John Doe',
				whatsappPn: '+1234567890',
				createdAt: new Date(),
			};
			const group = {
				id: 'group456',
				whatsappId: 'group456@g.us',
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};

			const testTimestamps = [
				{ unix: 0, expected: new Date(0) },
				{ unix: 1640995200, expected: new Date(1640995200000) },
				{ unix: 1999999999, expected: new Date(1999999999000) },
			];

			for (const { unix, expected } of testTimestamps) {
				const messageData = {
					user,
					group,
					whatsappId: `msg-${unix}@wa`,
					messageType: 'text',
					messageTimestamp: unix,
				};
				const mockMessage = {
					id: `message-${unix}`,
					whatsappId: messageData.whatsappId,
					userId: user.id,
					groupId: group.id,
					messageType: 'text',
					date: expected,
					createdAt: new Date(),
				};

				mockPrisma.message.upsert.mockResolvedValue(mockMessage);

				const result = await messageRepository.add(messageData);

				expect(mockPrisma.message.upsert).toHaveBeenCalledWith({
					where: { whatsappId: messageData.whatsappId },
					update: {},
					create: {
						userId: user.id,
						groupId: group.id,
						whatsappId: messageData.whatsappId,
						messageType: 'text',
						date: expected,
					},
				});
				expect(result).toEqual(mockMessage);

				jest.clearAllMocks();
			}
		});

		it('should handle empty string values', async () => {
			const user = {
				id: '',
				whatsappId: '',
				name: '',
				whatsappPn: '',
				createdAt: new Date(),
			};
			const group = {
				id: '',
				whatsappId: '',
				name: '',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};
			const messageData = {
				user,
				group,
				whatsappId: '',
				messageType: '',
				messageTimestamp: 0,
			};
			const mockMessage = {
				id: 'message1',
				whatsappId: '',
				userId: '',
				groupId: '',
				messageType: '',
				date: new Date(0),
				createdAt: new Date(),
			};

			mockPrisma.message.upsert.mockResolvedValue(mockMessage);

			const result = await messageRepository.add(messageData);

			expect(mockPrisma.message.upsert).toHaveBeenCalledWith({
				where: { whatsappId: '' },
				update: {},
				create: {
					userId: '',
					groupId: '',
					whatsappId: '',
					messageType: '',
					date: new Date(0),
				},
			});
			expect(result).toEqual(mockMessage);
		});

		it('should handle database errors', async () => {
			const user = {
				id: 'user123',
				whatsappId: 'wa123@c.us',
				name: 'John Doe',
				whatsappPn: '+1234567890',
				createdAt: new Date(),
			};
			const group = {
				id: 'group456',
				whatsappId: 'group456@g.us',
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};
			const messageData = {
				user,
				group,
				whatsappId: 'msg123@wa',
				messageType: 'text',
				messageTimestamp: 1640995200,
			};
			const error = new Error('Database connection failed');

			mockPrisma.message.upsert.mockRejectedValue(error);

			await expect(messageRepository.add(messageData)).rejects.toThrow(
				'Database connection failed'
			);

			expect(mockPrisma.message.upsert).toHaveBeenCalledWith({
				where: { whatsappId: messageData.whatsappId },
				update: {},
				create: {
					userId: user.id,
					groupId: group.id,
					whatsappId: messageData.whatsappId,
					messageType: messageData.messageType,
					date: new Date(messageData.messageTimestamp * 1000),
				},
			});
		});

		it('should handle negative timestamp', async () => {
			const user = {
				id: 'user123',
				whatsappId: 'wa123@c.us',
				name: 'John Doe',
				whatsappPn: '+1234567890',
				createdAt: new Date(),
			};
			const group = {
				id: 'group456',
				whatsappId: 'group456@g.us',
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};
			const messageData = {
				user,
				group,
				whatsappId: 'msg-negative@wa',
				messageType: 'text',
				messageTimestamp: -1000,
			};
			const expectedDate = new Date(-1000 * 1000);
			const mockMessage = {
				id: 'message-negative',
				whatsappId: messageData.whatsappId,
				userId: user.id,
				groupId: group.id,
				messageType: 'text',
				date: expectedDate,
				createdAt: new Date(),
			};

			mockPrisma.message.upsert.mockResolvedValue(mockMessage);

			const result = await messageRepository.add(messageData);

			expect(mockPrisma.message.upsert).toHaveBeenCalledWith({
				where: { whatsappId: messageData.whatsappId },
				update: {},
				create: {
					userId: user.id,
					groupId: group.id,
					whatsappId: messageData.whatsappId,
					messageType: messageData.messageType,
					date: expectedDate,
				},
			});
			expect(result).toEqual(mockMessage);
		});
	});
});
