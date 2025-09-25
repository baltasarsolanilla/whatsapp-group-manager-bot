import { whitelistRepository } from '@database/repositories/whitelistRepository';
import mockPrisma from '@database/__mocks__/prisma';

// Mock the prisma module
jest.mock('@database/prisma', () => mockPrisma);

describe('whitelistRepository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('upsert', () => {
		it('should upsert whitelist entry and return with relations', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const mockWhitelistWithRelations = {
				id: 'whitelist1',
				userId,
				groupId,
				createdAt: new Date(),
				user: {
					id: userId,
					whatsappId: 'wa123@c.us',
					name: 'John Doe',
					whatsappPn: '+1234567890',
					createdAt: new Date()
				},
				group: {
					id: groupId,
					whatsappId: 'group123@g.us',
					name: 'Test Group',
					inactivityThresholdMinutes: 43200,
					createdAt: new Date()
				}
			};

			mockPrisma.whitelist.upsert.mockResolvedValue({ id: 'whitelist1', userId, groupId, createdAt: new Date() });
			mockPrisma.whitelist.findUnique.mockResolvedValue(mockWhitelistWithRelations);

			const result = await whitelistRepository.upsert(userId, groupId);

			expect(mockPrisma.whitelist.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
				update: {},
				create: { userId, groupId },
			});
			expect(mockPrisma.whitelist.findUnique).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
				include: { user: true, group: true },
			});
			expect(result).toEqual(mockWhitelistWithRelations);
		});

		it('should handle empty string parameters', async () => {
			const userId = '';
			const groupId = '';
			const mockWhitelistWithRelations = {
				id: 'whitelist2',
				userId,
				groupId,
				createdAt: new Date(),
				user: {
					id: userId,
					whatsappId: '',
					name: null,
					whatsappPn: null,
					createdAt: new Date()
				},
				group: {
					id: groupId,
					whatsappId: '',
					name: null,
					inactivityThresholdMinutes: 43200,
					createdAt: new Date()
				}
			};

			mockPrisma.whitelist.upsert.mockResolvedValue({ id: 'whitelist2', userId, groupId, createdAt: new Date() });
			mockPrisma.whitelist.findUnique.mockResolvedValue(mockWhitelistWithRelations);

			const result = await whitelistRepository.upsert(userId, groupId);

			expect(mockPrisma.whitelist.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
				update: {},
				create: { userId, groupId },
			});
			expect(result).toEqual(mockWhitelistWithRelations);
		});

		it('should handle database errors in upsert', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const error = new Error('Upsert failed');

			mockPrisma.whitelist.upsert.mockRejectedValue(error);

			await expect(whitelistRepository.upsert(userId, groupId))
				.rejects.toThrow('Upsert failed');

			expect(mockPrisma.whitelist.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
				update: {},
				create: { userId, groupId },
			});
			expect(mockPrisma.whitelist.findUnique).not.toHaveBeenCalled();
		});

		it('should handle database errors in findUnique after upsert', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const error = new Error('Find failed');

			mockPrisma.whitelist.upsert.mockResolvedValue({ id: 'whitelist1', userId, groupId, createdAt: new Date() });
			mockPrisma.whitelist.findUnique.mockRejectedValue(error);

			await expect(whitelistRepository.upsert(userId, groupId))
				.rejects.toThrow('Find failed');

			expect(mockPrisma.whitelist.upsert).toHaveBeenCalled();
			expect(mockPrisma.whitelist.findUnique).toHaveBeenCalled();
		});
	});

	describe('list', () => {
		it('should list all whitelist entries when no groupId provided', async () => {
			const mockWhitelists = [
				{ id: '1', userId: 'user1', groupId: 'group1', createdAt: new Date() },
				{ id: '2', userId: 'user2', groupId: 'group2', createdAt: new Date() },
			];

			mockPrisma.whitelist.findMany.mockResolvedValue(mockWhitelists);

			const result = await whitelistRepository.list();

			expect(mockPrisma.whitelist.findMany).toHaveBeenCalledWith({
				where: undefined,
			});
			expect(result).toEqual(mockWhitelists);
		});

		it('should list whitelist entries for specific group when groupId provided', async () => {
			const groupId = 'group456';
			const mockWhitelists = [
				{ id: '1', userId: 'user1', groupId, createdAt: new Date() },
				{ id: '2', userId: 'user2', groupId, createdAt: new Date() },
			];

			mockPrisma.whitelist.findMany.mockResolvedValue(mockWhitelists);

			const result = await whitelistRepository.list(groupId);

			expect(mockPrisma.whitelist.findMany).toHaveBeenCalledWith({
				where: { groupId },
			});
			expect(result).toEqual(mockWhitelists);
		});

		it('should return empty array when no entries found', async () => {
			mockPrisma.whitelist.findMany.mockResolvedValue([]);

			const result = await whitelistRepository.list('nonexistent-group');

			expect(mockPrisma.whitelist.findMany).toHaveBeenCalledWith({
				where: { groupId: 'nonexistent-group' },
			});
			expect(result).toEqual([]);
		});

		it('should handle database errors', async () => {
			const error = new Error('Database query failed');
			mockPrisma.whitelist.findMany.mockRejectedValue(error);

			await expect(whitelistRepository.list()).rejects.toThrow('Database query failed');
		});
	});

	describe('remove', () => {
		it('should remove whitelist entry and return the removed entry when found', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const mockDeleteResult = { count: 1 };

			mockPrisma.whitelist.deleteMany.mockResolvedValue(mockDeleteResult);

			const result = await whitelistRepository.remove(userId, groupId);

			expect(mockPrisma.whitelist.deleteMany).toHaveBeenCalledWith({
				where: { userId, groupId },
			});
			expect(result).toEqual({ userId, groupId });
		});

		it('should return null when no entry found to delete', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const mockDeleteResult = { count: 0 };

			mockPrisma.whitelist.deleteMany.mockResolvedValue(mockDeleteResult);

			const result = await whitelistRepository.remove(userId, groupId);

			expect(mockPrisma.whitelist.deleteMany).toHaveBeenCalledWith({
				where: { userId, groupId },
			});
			expect(result).toBeNull();
		});

		it('should handle multiple deletions', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const mockDeleteResult = { count: 2 };

			mockPrisma.whitelist.deleteMany.mockResolvedValue(mockDeleteResult);

			const result = await whitelistRepository.remove(userId, groupId);

			expect(mockPrisma.whitelist.deleteMany).toHaveBeenCalledWith({
				where: { userId, groupId },
			});
			expect(result).toEqual({ userId, groupId });
		});

		it('should handle database errors', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const error = new Error('Delete operation failed');

			mockPrisma.whitelist.deleteMany.mockRejectedValue(error);

			await expect(whitelistRepository.remove(userId, groupId))
				.rejects.toThrow('Delete operation failed');

			expect(mockPrisma.whitelist.deleteMany).toHaveBeenCalledWith({
				where: { userId, groupId },
			});
		});

		it('should handle empty string parameters', async () => {
			const userId = '';
			const groupId = '';
			const mockDeleteResult = { count: 0 };

			mockPrisma.whitelist.deleteMany.mockResolvedValue(mockDeleteResult);

			const result = await whitelistRepository.remove(userId, groupId);

			expect(mockPrisma.whitelist.deleteMany).toHaveBeenCalledWith({
				where: { userId, groupId },
			});
			expect(result).toBeNull();
		});
	});
});