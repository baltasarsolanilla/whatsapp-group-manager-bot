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

import { groupMembershipRepository } from '@database/repositories/groupMembershipRepository';

const mockPrisma = require('@database/prisma');

describe('groupMembershipRepository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('upsert', () => {
		it('should upsert group membership successfully', async () => {
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
			const mockMembership = {
				id: 'membership1',
				userId: user.id,
				groupId: group.id,
				joinDate: new Date(),
				lastActiveAt: new Date(),
				createdAt: new Date(),
			};

			mockPrisma.groupMembership.upsert.mockResolvedValue(mockMembership);

			const result = await groupMembershipRepository.upsert({ user, group });

			expect(mockPrisma.groupMembership.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId: user.id, groupId: group.id } },
				update: { lastActiveAt: expect.any(Date) },
				create: {
					userId: user.id,
					groupId: group.id,
					joinDate: expect.any(Date),
				},
			});
			expect(result).toEqual(mockMembership);
		});

		it('should handle existing membership by updating lastActiveAt', async () => {
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
			const existingMembership = {
				id: 'membership1',
				userId: user.id,
				groupId: group.id,
				joinDate: new Date(2023, 0, 1),
				lastActiveAt: new Date(),
				createdAt: new Date(2023, 0, 1),
			};

			mockPrisma.groupMembership.upsert.mockResolvedValue(existingMembership);

			const result = await groupMembershipRepository.upsert({ user, group });

			expect(mockPrisma.groupMembership.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId: user.id, groupId: group.id } },
				update: { lastActiveAt: expect.any(Date) },
				create: {
					userId: user.id,
					groupId: group.id,
					joinDate: expect.any(Date),
				},
			});
			expect(result).toEqual(existingMembership);
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
			const error = new Error('Database connection failed');

			mockPrisma.groupMembership.upsert.mockRejectedValue(error);

			await expect(
				groupMembershipRepository.upsert({ user, group })
			).rejects.toThrow('Database connection failed');

			expect(mockPrisma.groupMembership.upsert).toHaveBeenCalledWith({
				where: { userId_groupId: { userId: user.id, groupId: group.id } },
				update: { lastActiveAt: expect.any(Date) },
				create: {
					userId: user.id,
					groupId: group.id,
					joinDate: expect.any(Date),
				},
			});
		});
	});

	describe('listByGroupId', () => {
		it('should list all memberships for a group without excluding whitelist', async () => {
			const groupId = 'group123';
			const mockMemberships = [
				{
					id: 'membership1',
					userId: 'user1',
					groupId,
					joinDate: new Date(),
					lastActiveAt: new Date(),
					createdAt: new Date(),
					user: { id: 'user1', whatsappId: 'wa1@c.us', name: 'User 1' },
					group: {
						id: groupId,
						whatsappId: 'group123@g.us',
						name: 'Test Group',
					},
				},
				{
					id: 'membership2',
					userId: 'user2',
					groupId,
					joinDate: new Date(),
					lastActiveAt: new Date(),
					createdAt: new Date(),
					user: { id: 'user2', whatsappId: 'wa2@c.us', name: 'User 2' },
					group: {
						id: groupId,
						whatsappId: 'group123@g.us',
						name: 'Test Group',
					},
				},
			];

			mockPrisma.groupMembership.findMany.mockResolvedValue(mockMemberships);

			const result = await groupMembershipRepository.listByGroupId(
				groupId,
				false
			);

			expect(mockPrisma.groupMembership.findMany).toHaveBeenCalledWith({
				where: { groupId },
				include: { user: true, group: true },
			});
			expect(result).toEqual(mockMemberships);
		});

		it('should list memberships excluding whitelisted users when excludeWhitelist is true', async () => {
			const groupId = 'group123';
			const mockMemberships = [
				{
					id: 'membership1',
					userId: 'user1',
					groupId,
					joinDate: new Date(),
					lastActiveAt: new Date(),
					createdAt: new Date(),
					user: { id: 'user1', whatsappId: 'wa1@c.us', name: 'User 1' },
					group: {
						id: groupId,
						whatsappId: 'group123@g.us',
						name: 'Test Group',
					},
				},
			];

			mockPrisma.groupMembership.findMany.mockResolvedValue(mockMemberships);

			const result = await groupMembershipRepository.listByGroupId(
				groupId,
				true
			);

			expect(mockPrisma.groupMembership.findMany).toHaveBeenCalledWith({
				where: {
					groupId,
					user: {
						whitelistEntries: { none: { groupId } },
					},
				},
				include: { user: true, group: true },
			});
			expect(result).toEqual(mockMemberships);
		});

		it('should return empty array when no memberships found', async () => {
			const groupId = 'nonexistent-group';

			mockPrisma.groupMembership.findMany.mockResolvedValue([]);

			const result = await groupMembershipRepository.listByGroupId(groupId);

			expect(mockPrisma.groupMembership.findMany).toHaveBeenCalledWith({
				where: { groupId },
				include: { user: true, group: true },
			});
			expect(result).toEqual([]);
		});

		it('should use default excludeWhitelist value (false)', async () => {
			const groupId = 'group123';
			const mockMemberships: any[] = [];

			mockPrisma.groupMembership.findMany.mockResolvedValue(mockMemberships);

			const result = await groupMembershipRepository.listByGroupId(groupId);

			expect(mockPrisma.groupMembership.findMany).toHaveBeenCalledWith({
				where: { groupId },
				include: { user: true, group: true },
			});
			expect(result).toEqual([]);
		});

		it('should handle database errors', async () => {
			const groupId = 'group123';
			const error = new Error('Database query failed');

			mockPrisma.groupMembership.findMany.mockRejectedValue(error);

			await expect(
				groupMembershipRepository.listByGroupId(groupId)
			).rejects.toThrow('Database query failed');
		});
	});

	describe('removeByUserAndGroup', () => {
		it('should remove membership successfully', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const mockRemovedMembership = {
				id: 'membership1',
				userId,
				groupId,
				joinDate: new Date(),
				lastActiveAt: new Date(),
				createdAt: new Date(),
			};

			mockPrisma.groupMembership.delete.mockResolvedValue(
				mockRemovedMembership
			);

			const result = await groupMembershipRepository.removeByUserAndGroup({
				userId,
				groupId,
			});

			expect(mockPrisma.groupMembership.delete).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
			});
			expect(result).toEqual(mockRemovedMembership);
		});

		it('should handle empty string parameters', async () => {
			const userId = '';
			const groupId = '';

			mockPrisma.groupMembership.delete.mockResolvedValue(null);

			const result = await groupMembershipRepository.removeByUserAndGroup({
				userId,
				groupId,
			});

			expect(mockPrisma.groupMembership.delete).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
			});
			expect(result).toBeNull();
		});

		it('should handle database errors', async () => {
			const userId = 'user123';
			const groupId = 'group456';
			const error = new Error('Delete operation failed');

			mockPrisma.groupMembership.delete.mockRejectedValue(error);

			await expect(
				groupMembershipRepository.removeByUserAndGroup({ userId, groupId })
			).rejects.toThrow('Delete operation failed');

			expect(mockPrisma.groupMembership.delete).toHaveBeenCalledWith({
				where: { userId_groupId: { userId, groupId } },
			});
		});

		it('should handle non-existent membership', async () => {
			const userId = 'nonexistent-user';
			const groupId = 'nonexistent-group';
			const error = new Error('Record to delete does not exist');

			mockPrisma.groupMembership.delete.mockRejectedValue(error);

			await expect(
				groupMembershipRepository.removeByUserAndGroup({ userId, groupId })
			).rejects.toThrow('Record to delete does not exist');
		});
	});
});
