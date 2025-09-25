import { removalQueueRepository } from '@database/repositories/removalQueueRepository';
import mockPrisma from '@database/__mocks__/prisma';

// Mock the prisma module
jest.mock('@database/prisma', () => mockPrisma);

describe('removalQueueRepository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('upsertUser', () => {
		it('should upsert user in removal queue successfully', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const mockRemovalQueue = {
				id: 'rq1',
				userId,
				groupId,
				createdAt: new Date()
			};

			mockPrisma.removalQueue.upsert.mockResolvedValue(mockRemovalQueue);

			const result = await removalQueueRepository.upsertUser({ userId, groupId });

			expect(mockPrisma.removalQueue.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
				update: {},
				create: { userId, groupId },
			});
			expect(result).toEqual(mockRemovalQueue);
		});

		it('should handle empty string parameters', async () => {
			const userId = '';
			const groupId = '';
			const mockRemovalQueue = {
				id: 'rq2',
				userId,
				groupId,
				createdAt: new Date()
			};

			mockPrisma.removalQueue.upsert.mockResolvedValue(mockRemovalQueue);

			const result = await removalQueueRepository.upsertUser({ userId, groupId });

			expect(mockPrisma.removalQueue.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
				update: {},
				create: { userId, groupId },
			});
			expect(result).toEqual(mockRemovalQueue);
		});

		it('should handle database errors', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const error = new Error('Database connection failed');

			mockPrisma.removalQueue.upsert.mockRejectedValue(error);

			await expect(removalQueueRepository.upsertUser({ userId, groupId }))
				.rejects.toThrow('Database connection failed');

			expect(mockPrisma.removalQueue.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
				update: {},
				create: { userId, groupId },
			});
		});
	});

	describe('remove', () => {
		it('should remove entry from removal queue successfully', async () => {
			const id = 'rq123';
			const mockRemovedEntry = {
				id,
				userId: 'user123',
				groupId: 'group456',
				createdAt: new Date()
			};

			mockPrisma.removalQueue.delete.mockResolvedValue(mockRemovedEntry);

			const result = await removalQueueRepository.remove(id);

			expect(mockPrisma.removalQueue.delete).toHaveBeenCalledWith({
				where: { id },
			});
			expect(result).toEqual(mockRemovedEntry);
		});

		it('should handle empty string id', async () => {
			const id = '';

			mockPrisma.removalQueue.delete.mockResolvedValue(null);

			const result = await removalQueueRepository.remove(id);

			expect(mockPrisma.removalQueue.delete).toHaveBeenCalledWith({
				where: { id },
			});
			expect(result).toBeNull();
		});

		it('should handle database errors', async () => {
			const id = 'rq123';
			const error = new Error('Delete operation failed');

			mockPrisma.removalQueue.delete.mockRejectedValue(error);

			await expect(removalQueueRepository.remove(id))
				.rejects.toThrow('Delete operation failed');

			expect(mockPrisma.removalQueue.delete).toHaveBeenCalledWith({
				where: { id },
			});
		});

		it('should handle non-existent id', async () => {
			const id = 'nonexistent';
			const error = new Error('Record to delete does not exist');

			mockPrisma.removalQueue.delete.mockRejectedValue(error);

			await expect(removalQueueRepository.remove(id))
				.rejects.toThrow('Record to delete does not exist');
		});
	});

	describe('getUsers', () => {
		it('should get all users when no groupId provided', async () => {
			const mockUsers = [
				{
					id: 'rq1',
					userId: 'user1',
					groupId: 'group1',
					createdAt: new Date(),
					user: { id: 'user1', whatsappId: 'wa1@c.us', name: 'User 1' },
					group: { id: 'group1', whatsappId: 'group1@g.us', name: 'Group 1' }
				},
				{
					id: 'rq2',
					userId: 'user2',
					groupId: 'group2',
					createdAt: new Date(),
					user: { id: 'user2', whatsappId: 'wa2@c.us', name: 'User 2' },
					group: { id: 'group2', whatsappId: 'group2@g.us', name: 'Group 2' }
				}
			];

			mockPrisma.removalQueue.findMany.mockResolvedValue(mockUsers);

			const result = await removalQueueRepository.getUsers();

			expect(mockPrisma.removalQueue.findMany).toHaveBeenCalledWith({
				where: {},
				include: { user: true, group: true },
			});
			expect(result).toEqual(mockUsers);
		});

		it('should get users for specific group when groupId provided', async () => {
			const groupId = 'group123';
			const mockUsers = [
				{
					id: 'rq1',
					userId: 'user1',
					groupId,
					createdAt: new Date(),
					user: { id: 'user1', whatsappId: 'wa1@c.us', name: 'User 1' },
					group: { id: groupId, whatsappId: 'group123@g.us', name: 'Test Group' }
				}
			];

			mockPrisma.removalQueue.findMany.mockResolvedValue(mockUsers);

			const result = await removalQueueRepository.getUsers(groupId);

			expect(mockPrisma.removalQueue.findMany).toHaveBeenCalledWith({
				where: { groupId },
				include: { user: true, group: true },
			});
			expect(result).toEqual(mockUsers);
		});

		it('should return empty array when no users found', async () => {
			mockPrisma.removalQueue.findMany.mockResolvedValue([]);

			const result = await removalQueueRepository.getUsers('nonexistent-group');

			expect(mockPrisma.removalQueue.findMany).toHaveBeenCalledWith({
				where: { groupId: 'nonexistent-group' },
				include: { user: true, group: true },
			});
			expect(result).toEqual([]);
		});

		it('should handle database errors', async () => {
			const error = new Error('Database query failed');
			mockPrisma.removalQueue.findMany.mockRejectedValue(error);

			await expect(removalQueueRepository.getUsers()).rejects.toThrow('Database query failed');
		});
	});

	describe('getNextBatch', () => {
		it('should get next batch with specified take and no groupId', async () => {
			const take = 5;
			const mockBatch = [
				{
					id: 'rq1',
					userId: 'user1',
					groupId: 'group1',
					createdAt: new Date(2023, 0, 1),
					user: { id: 'user1', whatsappId: 'wa1@c.us', name: 'User 1' },
					group: { id: 'group1', whatsappId: 'group1@g.us', name: 'Group 1' }
				},
				{
					id: 'rq2',
					userId: 'user2',
					groupId: 'group2',
					createdAt: new Date(2023, 0, 2),
					user: { id: 'user2', whatsappId: 'wa2@c.us', name: 'User 2' },
					group: { id: 'group2', whatsappId: 'group2@g.us', name: 'Group 2' }
				}
			];

			mockPrisma.removalQueue.findMany.mockResolvedValue(mockBatch);

			const result = await removalQueueRepository.getNextBatch({ take });

			expect(mockPrisma.removalQueue.findMany).toHaveBeenCalledWith({
				where: {},
				take,
				orderBy: { createdAt: 'asc' },
				include: { user: true, group: true },
			});
			expect(result).toEqual(mockBatch);
		});

		it('should get next batch with specified take and groupId', async () => {
			const take = 3;
			const groupId = 'group123';
			const mockBatch = [
				{
					id: 'rq1',
					userId: 'user1',
					groupId,
					createdAt: new Date(2023, 0, 1),
					user: { id: 'user1', whatsappId: 'wa1@c.us', name: 'User 1' },
					group: { id: groupId, whatsappId: 'group123@g.us', name: 'Test Group' }
				}
			];

			mockPrisma.removalQueue.findMany.mockResolvedValue(mockBatch);

			const result = await removalQueueRepository.getNextBatch({ groupId, take });

			expect(mockPrisma.removalQueue.findMany).toHaveBeenCalledWith({
				where: { groupId },
				take,
				orderBy: { createdAt: 'asc' },
				include: { user: true, group: true },
			});
			expect(result).toEqual(mockBatch);
		});

		it('should return empty array when no items in queue', async () => {
			const take = 5;
			mockPrisma.removalQueue.findMany.mockResolvedValue([]);

			const result = await removalQueueRepository.getNextBatch({ take });

			expect(mockPrisma.removalQueue.findMany).toHaveBeenCalledWith({
				where: {},
				take,
				orderBy: { createdAt: 'asc' },
				include: { user: true, group: true },
			});
			expect(result).toEqual([]);
		});

		it('should handle zero take parameter', async () => {
			const take = 0;
			mockPrisma.removalQueue.findMany.mockResolvedValue([]);

			const result = await removalQueueRepository.getNextBatch({ take });

			expect(mockPrisma.removalQueue.findMany).toHaveBeenCalledWith({
				where: {},
				take,
				orderBy: { createdAt: 'asc' },
				include: { user: true, group: true },
			});
			expect(result).toEqual([]);
		});

		it('should handle database errors', async () => {
			const take = 5;
			const error = new Error('Database query failed');

			mockPrisma.removalQueue.findMany.mockRejectedValue(error);

			await expect(removalQueueRepository.getNextBatch({ take }))
				.rejects.toThrow('Database query failed');
		});
	});
});