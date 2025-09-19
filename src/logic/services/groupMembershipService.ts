import { groupMembershipRepository } from '@database/repositories';
import { Group, User } from '@prisma/client';

export const groupMembershipService = {
	async getInactive(group: Group): Promise<{ user: User; group: Group }[]> {
		// const days = 30;
		// const msPerDay = 24 * 60 * 60 * 1000;
		// const threshold = Date.now() - days * msPerDay;
		const test = 60 * 10 * 1000;
		const threshold = Date.now() - test;

		const memberships = await groupMembershipRepository.listByGroupId(
			group.id,
			true
		);

		const inactiveMemberships = memberships.filter((m) => {
			const activity = m.lastActiveAt ?? m.joinDate;
			return activity.getTime() <= threshold;
		});

		return inactiveMemberships;
	},
};
