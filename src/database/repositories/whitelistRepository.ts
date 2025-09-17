import prisma from '@database/prisma';
import { Whitelist } from '@prisma/client';

export const whitelistRepository = {
	async add(userId: string, groupId: string): Promise<Whitelist> {
		return prisma.whitelist.create({
			data: {
				userId,
				groupId,
			},
		});
	},

	async list(groupId?: string): Promise<Whitelist[]> {
		return prisma.whitelist.findMany({
			where: groupId ? { groupId } : undefined,
		});
	},

	async remove(userId: string, groupId: string): Promise<Whitelist | null> {
		return prisma.whitelist
			.deleteMany({
				where: { userId, groupId },
			})
			.then((result) =>
				result.count > 0 ? ({ userId, groupId } as Whitelist) : null
			);
	},
};
