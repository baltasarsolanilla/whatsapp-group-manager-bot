import prisma from '@database/prisma';
import { Blacklist } from '@prisma/client';

export const blacklistRepository = {
	async add(userId: string, groupId: string): Promise<Blacklist> {
		return prisma.blacklist.create({
			data: {
				userId,
				groupId,
			},
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
