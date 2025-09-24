import prisma from '@database/prisma';
import { Blacklist } from '@prisma/client';

export const blacklistRepository = {
	async upsert(userId: string, groupId: string): Promise<Blacklist> {
		return prisma.blacklist.upsert({
			where: { userId_groupId: { userId, groupId } },
			update: {},
			create: { userId, groupId },
		});
	},

	async list(groupId?: string): Promise<Blacklist[]> {
		return prisma.blacklist.findMany({
			where: groupId ? { groupId } : undefined,
		});
	},

	async remove(userId: string, groupId: string): Promise<Blacklist | null> {
		return prisma.blacklist
			.deleteMany({
				where: { userId, groupId },
			})
			.then((result) =>
				result.count > 0 ? ({ userId, groupId } as Blacklist) : null
			);
	},
};
