import prisma from '@database/prisma';

export const removalQueueRepository = {
	async upsertUser({ userId, groupId }: { userId: string; groupId: string }) {
		return prisma.removalQueue.upsert({
			where: {
				userId_groupId: {
					userId,
					groupId,
				},
			},
			update: {}, // no-op on duplicate
			create: {
				userId,
				groupId,
			},
		});
	},

	async remove(id: string) {
		return prisma.removalQueue.delete({
			where: { id },
		});
	},

	async getUsers(groupId?: string) {
		return prisma.removalQueue.findMany({
			where: {
				...(groupId ? { groupId } : {}),
			},
			include: {
				user: true,
				group: true,
			},
		});
	},

	async getNextBatch({ groupId, take }: { groupId?: string; take: number }) {
		return await prisma.removalQueue.findMany({
			where: {
				...(groupId ? { groupId } : {}),
			},
			take,
			orderBy: { createdAt: 'asc' }, // oldest first
			include: { user: true, group: true },
		});
	},

	async deleteAll() {
		return prisma.removalQueue.deleteMany({});
	},
};
