import prisma from '@database/prisma';
import { Group, User, Whitelist } from '@prisma/client';

export const whitelistRepository = {
	async upsert(
		userId: string,
		groupId: string
	): Promise<Whitelist & { user: User; group: Group }> {
		await prisma.whitelist.upsert({
			where: { userId_groupId: { userId, groupId } },
			update: {},
			create: { userId, groupId },
		});

		return prisma.whitelist.findUnique({
			where: { userId_groupId: { userId, groupId } },
			include: { user: true, group: true },
		}) as Promise<Whitelist & { user: User; group: Group }>;
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
