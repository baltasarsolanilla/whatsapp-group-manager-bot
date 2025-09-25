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

import { groupRepository } from '@database/repositories/groupRepository';

const mockPrisma = require('@database/prisma');

describe('groupRepository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('upsert', () => {
		it('should upsert a group successfully with whatsappId and name', async () => {
			const whatsappId = 'wa123@g.us';
			const name = 'Test Group';
			const mockGroup = {
				id: 'group1',
				whatsappId,
				name,
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};

			mockPrisma.group.upsert.mockResolvedValue(mockGroup);

			const result = await groupRepository.upsert({ whatsappId, name });

			expect(mockPrisma.group.upsert).toHaveBeenCalledWith({
				where: { whatsappId },
				update: { name },
				create: { whatsappId, name },
			});
			expect(result).toEqual(mockGroup);
		});

		it('should upsert a group successfully with only whatsappId', async () => {
			const whatsappId = 'wa123@g.us';
			const mockGroup = {
				id: 'group1',
				whatsappId,
				name: null,
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};

			mockPrisma.group.upsert.mockResolvedValue(mockGroup);

			const result = await groupRepository.upsert({ whatsappId });

			expect(mockPrisma.group.upsert).toHaveBeenCalledWith({
				where: { whatsappId },
				update: {},
				create: { whatsappId },
			});
			expect(result).toEqual(mockGroup);
		});

		it('should handle undefined name properly', async () => {
			const whatsappId = 'wa123@g.us';
			const name = undefined;
			const mockGroup = {
				id: 'group1',
				whatsappId,
				name: null,
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};

			mockPrisma.group.upsert.mockResolvedValue(mockGroup);

			const result = await groupRepository.upsert({ whatsappId, name });

			expect(mockPrisma.group.upsert).toHaveBeenCalledWith({
				where: { whatsappId },
				update: {},
				create: { whatsappId },
			});
			expect(result).toEqual(mockGroup);
		});

		it('should handle empty string name', async () => {
			const whatsappId = 'wa123@g.us';
			const name = '';
			const mockGroup = {
				id: 'group1',
				whatsappId,
				name: '',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};

			mockPrisma.group.upsert.mockResolvedValue(mockGroup);

			const result = await groupRepository.upsert({ whatsappId, name });

			expect(mockPrisma.group.upsert).toHaveBeenCalledWith({
				where: { whatsappId },
				update: { name },
				create: { whatsappId, name },
			});
			expect(result).toEqual(mockGroup);
		});

		it('should handle database errors', async () => {
			const whatsappId = 'wa123@g.us';
			const name = 'Test Group';
			const error = new Error('Database connection failed');

			mockPrisma.group.upsert.mockRejectedValue(error);

			await expect(
				groupRepository.upsert({ whatsappId, name })
			).rejects.toThrow('Database connection failed');

			expect(mockPrisma.group.upsert).toHaveBeenCalledWith({
				where: { whatsappId },
				update: { name },
				create: { whatsappId, name },
			});
		});
	});

	describe('getByWaId', () => {
		it('should return group when found', async () => {
			const whatsappId = 'wa123@g.us';
			const mockGroup = {
				id: 'group1',
				whatsappId,
				name: 'Test Group',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};

			mockPrisma.group.findUnique.mockResolvedValue(mockGroup);

			const result = await groupRepository.getByWaId(whatsappId);

			expect(mockPrisma.group.findUnique).toHaveBeenCalledWith({
				where: { whatsappId },
			});
			expect(result).toEqual(mockGroup);
		});

		it('should return null when group not found', async () => {
			const whatsappId = 'nonexistent@g.us';

			mockPrisma.group.findUnique.mockResolvedValue(null);

			const result = await groupRepository.getByWaId(whatsappId);

			expect(mockPrisma.group.findUnique).toHaveBeenCalledWith({
				where: { whatsappId },
			});
			expect(result).toBeNull();
		});

		it('should handle empty string whatsappId', async () => {
			const whatsappId = '';

			mockPrisma.group.findUnique.mockResolvedValue(null);

			const result = await groupRepository.getByWaId(whatsappId);

			expect(mockPrisma.group.findUnique).toHaveBeenCalledWith({
				where: { whatsappId },
			});
			expect(result).toBeNull();
		});

		it('should handle database errors', async () => {
			const whatsappId = 'wa123@g.us';
			const error = new Error('Database query failed');

			mockPrisma.group.findUnique.mockRejectedValue(error);

			await expect(groupRepository.getByWaId(whatsappId)).rejects.toThrow(
				'Database query failed'
			);
		});
	});

	describe('update', () => {
		it('should update group successfully with partial data', async () => {
			const groupId = 'group123';
			const updateData = {
				name: 'Updated Group Name',
				inactivityThresholdMinutes: 60000,
			};
			const mockUpdatedGroup = {
				id: groupId,
				whatsappId: 'wa123@g.us',
				...updateData,
				createdAt: new Date(),
			};

			mockPrisma.group.update.mockResolvedValue(mockUpdatedGroup);

			const result = await groupRepository.update(groupId, updateData);

			expect(mockPrisma.group.update).toHaveBeenCalledWith({
				where: { id: groupId },
				data: updateData,
			});
			expect(result).toEqual(mockUpdatedGroup);
		});

		it('should update group with single field', async () => {
			const groupId = 'group123';
			const updateData = { name: 'New Name Only' };
			const mockUpdatedGroup = {
				id: groupId,
				whatsappId: 'wa123@g.us',
				name: 'New Name Only',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};

			mockPrisma.group.update.mockResolvedValue(mockUpdatedGroup);

			const result = await groupRepository.update(groupId, updateData);

			expect(mockPrisma.group.update).toHaveBeenCalledWith({
				where: { id: groupId },
				data: updateData,
			});
			expect(result).toEqual(mockUpdatedGroup);
		});

		it('should handle empty update data', async () => {
			const groupId = 'group123';
			const updateData = {};
			const mockUpdatedGroup = {
				id: groupId,
				whatsappId: 'wa123@g.us',
				name: 'Existing Name',
				inactivityThresholdMinutes: 43200,
				createdAt: new Date(),
			};

			mockPrisma.group.update.mockResolvedValue(mockUpdatedGroup);

			const result = await groupRepository.update(groupId, updateData);

			expect(mockPrisma.group.update).toHaveBeenCalledWith({
				where: { id: groupId },
				data: updateData,
			});
			expect(result).toEqual(mockUpdatedGroup);
		});

		it('should handle database errors', async () => {
			const groupId = 'group123';
			const updateData = { name: 'Updated Name' };
			const error = new Error('Update failed');

			mockPrisma.group.update.mockRejectedValue(error);

			await expect(groupRepository.update(groupId, updateData)).rejects.toThrow(
				'Update failed'
			);

			expect(mockPrisma.group.update).toHaveBeenCalledWith({
				where: { id: groupId },
				data: updateData,
			});
		});

		it('should handle non-existent group id', async () => {
			const groupId = 'nonexistent-group';
			const updateData = { name: 'New Name' };
			const error = new Error('Record to update not found');

			mockPrisma.group.update.mockRejectedValue(error);

			await expect(groupRepository.update(groupId, updateData)).rejects.toThrow(
				'Record to update not found'
			);
		});
	});
});
