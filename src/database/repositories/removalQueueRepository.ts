import prisma from '@database/prisma';
import { type Group, type User, RemovalStatus } from '@prisma/client';

export const removalQueueRepository = {
	// Add to removal queue
	async addUser({ user, group }: { user: User; group: Group }) {
		await prisma.removalQueue.create({
			data: {
				userId: user.id,
				groupId: group.id,
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
