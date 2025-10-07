import prisma from '@database/prisma';
import type { Group, GroupMembership, User } from '@prisma/client';

export const groupMembershipRepository = {
	async upsert({
		user,
		group,
	}: {
		user: User;
		group: Group;
	}): Promise<GroupMembership> {
		return prisma.groupMembership.upsert({
			where: {
				userId_groupId: { userId: user.id, groupId: group.id },
			},
			update: {
				lastActiveAt: new Date(),
			},
			create: {
				userId: user.id,
				groupId: group.id,
				joinDate: new Date(),
			},
		});
	},

	async listByGroupId(groupId: string, excludeWhitelist: boolean = false) {
		return prisma.groupMembership.findMany({
			where: {
				groupId,
				...(excludeWhitelist
					? {
							user: {
								whitelistEntries: { none: { groupId } },
							},
						}
					: {}),
			},
			include: {
				user: true,
				group: true,
			},
		});
	},

	async removeByUserAndGroup({
		userId,
		groupId,
	}: {
		userId: string;
		groupId: string;
	}) {
		return prisma.groupMembership.delete({
			where: {
				userId_groupId: {
					userId,
					groupId,
				},
			},
		});
	},
};
