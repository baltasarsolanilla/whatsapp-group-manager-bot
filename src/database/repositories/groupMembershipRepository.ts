import prisma from '@database/prisma';
import type { Group, GroupMembership, User } from '@prisma/client';

export const groupMembershipRepository = {
	async upsertGroupMembership({
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

	// Find inactive members (30+ days)
	async inactiveMembers(group: Group): Promise<{ user: User; group: Group }[]> {
		const days = 30;
		const msPerDay = 24 * 60 * 60 * 1000;
		const threshold = Date.now() - days * msPerDay;
		// const threshold = Date.now();

		const memberships = await prisma.groupMembership.findMany({
			where: {
				groupId: group.id,
				user: {
					whitelistEntries: { none: { groupId: group.id } },
				},
			},
			include: {
				user: true,
				group: true,
			},
		});

		return memberships.filter((m) => {
			const activity = m.lastActiveAt ?? m.joinDate;
			return activity.getTime() <= threshold;
		});
	},
};
