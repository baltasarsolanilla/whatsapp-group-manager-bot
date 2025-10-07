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
		// Check if membership exists before attempting to delete
		const membership = await prisma.groupMembership.findUnique({
			where: {
				userId_groupId: {
					userId,
					groupId,
				},
			},
		});

		// If membership doesn't exist, return null instead of throwing error
		if (!membership) {
			console.log(
				`ℹ️  Membership not found for user ${userId} in group ${groupId}, skipping deletion`
			);
			return null;
		}

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
