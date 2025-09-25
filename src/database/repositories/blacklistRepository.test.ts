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

import { blacklistRepository } from '@database/repositories/blacklistRepository';

const mockPrisma = require('@database/prisma');

describe('blacklistRepository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('upsert', () => {
		it('should upsert a blacklist entry successfully', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const mockBlacklist = { id: '1', userId, groupId, createdAt: new Date() };

			mockPrisma.blacklist.upsert.mockResolvedValue(mockBlacklist);

			const result = await blacklistRepository.upsert(userId, groupId);

			expect(mockPrisma.blacklist.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
				update: {},
				create: { userId, groupId },
			});
			expect(result).toEqual(mockBlacklist);
		});

		it('should handle empty strings', async () => {
			const userId = '';
			const groupId = '';
			const mockBlacklist = { id: '2', userId, groupId, createdAt: new Date() };

			mockPrisma.blacklist.upsert.mockResolvedValue(mockBlacklist);

			const result = await blacklistRepository.upsert(userId, groupId);

			expect(mockPrisma.blacklist.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
				update: {},
				create: { userId, groupId },
			});
			expect(result).toEqual(mockBlacklist);
		});

		it('should handle database errors', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const error = new Error('Database connection failed');

			mockPrisma.blacklist.upsert.mockRejectedValue(error);

			await expect(blacklistRepository.upsert(userId, groupId)).rejects.toThrow(
				'Database connection failed'
			);

			expect(mockPrisma.blacklist.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
				update: {},
				create: { userId, groupId },
			});
		});
	});

	describe('list', () => {
		it('should list all blacklist entries when no groupId provided', async () => {
			const mockBlacklists = [
				{ id: '1', userId: 'user1', groupId: 'group1', createdAt: new Date() },
				{ id: '2', userId: 'user2', groupId: 'group2', createdAt: new Date() },
			];

			mockPrisma.blacklist.findMany.mockResolvedValue(mockBlacklists);

			const result = await blacklistRepository.list();

			expect(mockPrisma.blacklist.findMany).toHaveBeenCalledWith({
				where: undefined,
			});
			expect(result).toEqual(mockBlacklists);
		});

		it('should list blacklist entries for specific group when groupId provided', async () => {
			const groupId = 'group456';
			const mockBlacklists = [
				{ id: '1', userId: 'user1', groupId, createdAt: new Date() },
				{ id: '2', userId: 'user2', groupId, createdAt: new Date() },
			];

			mockPrisma.blacklist.findMany.mockResolvedValue(mockBlacklists);

			const result = await blacklistRepository.list(groupId);

			expect(mockPrisma.blacklist.findMany).toHaveBeenCalledWith({
				where: { groupId },
			});
			expect(result).toEqual(mockBlacklists);
		});

		it('should return empty array when no entries found', async () => {
			mockPrisma.blacklist.findMany.mockResolvedValue([]);

			const result = await blacklistRepository.list('nonexistent-group');

			expect(mockPrisma.blacklist.findMany).toHaveBeenCalledWith({
				where: { groupId: 'nonexistent-group' },
			});
			expect(result).toEqual([]);
		});

		it('should handle database errors', async () => {
			const error = new Error('Database query failed');
			mockPrisma.blacklist.findMany.mockRejectedValue(error);

			await expect(blacklistRepository.list()).rejects.toThrow(
				'Database query failed'
			);
		});
	});

	describe('remove', () => {
		it('should remove blacklist entry and return the removed entry when found', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const mockDeleteResult = { count: 1 };

			mockPrisma.blacklist.deleteMany.mockResolvedValue(mockDeleteResult);

			const result = await blacklistRepository.remove(userId, groupId);

			expect(mockPrisma.blacklist.deleteMany).toHaveBeenCalledWith({
				where: { userId, groupId },
			});
			expect(result).toEqual({ userId, groupId });
		});

		it('should return null when no entry found to delete', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const mockDeleteResult = { count: 0 };

			mockPrisma.blacklist.deleteMany.mockResolvedValue(mockDeleteResult);

			const result = await blacklistRepository.remove(userId, groupId);

			expect(mockPrisma.blacklist.deleteMany).toHaveBeenCalledWith({
				where: { userId, groupId },
			});
			expect(result).toBeNull();
		});

		it('should handle multiple deletions', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const mockDeleteResult = { count: 2 };

			mockPrisma.blacklist.deleteMany.mockResolvedValue(mockDeleteResult);

			const result = await blacklistRepository.remove(userId, groupId);

			expect(mockPrisma.blacklist.deleteMany).toHaveBeenCalledWith({
				where: { userId, groupId },
			});
			expect(result).toEqual({ userId, groupId });
		});

		it('should handle database errors', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const error = new Error('Delete operation failed');

			mockPrisma.blacklist.deleteMany.mockRejectedValue(error);

			await expect(blacklistRepository.remove(userId, groupId)).rejects.toThrow(
				'Delete operation failed'
			);

			expect(mockPrisma.blacklist.deleteMany).toHaveBeenCalledWith({
				where: { userId, groupId },
			});
		});

		it('should handle empty string parameters', async () => {
			const userId = '';
			const groupId = '';
			const mockDeleteResult = { count: 0 };

			mockPrisma.blacklist.deleteMany.mockResolvedValue(mockDeleteResult);

			const result = await blacklistRepository.remove(userId, groupId);

			expect(mockPrisma.blacklist.deleteMany).toHaveBeenCalledWith({
				where: { userId, groupId },
			});
			expect(result).toBeNull();
		});
	});
});
