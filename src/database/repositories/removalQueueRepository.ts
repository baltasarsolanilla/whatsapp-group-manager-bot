import prisma from '@database/prisma';
import { RemovalStatus } from '@prisma/client';

export const removalQueueRepository = {
	// Add to removal queue
	async addUser({ userId, groupId }: { userId: string; groupId: string }) {
		return prisma.removalQueue.upsert({
			where: {
				userId_groupId: {
					userId,
					groupId,
				},
			},
			update: {
				status: RemovalStatus.PENDING,
			},
			create: {
				userId,
				groupId,
				status: RemovalStatus.PENDING,
			},
		});
	},

	async getUsersByGroupId(groupId?: string, status?: RemovalStatus) {
		return prisma.removalQueue.findMany({
			where: {
				...(groupId ? { groupId } : {}),
				...(status ? { status } : {}),
			},
			include: {
				user: true,
				group: true,
			},
		});
	},

	async updateStatusById(id: string, status: RemovalStatus) {
		return prisma.removalQueue.update({
			where: { id },
			data: { status },
		});
	},
};
