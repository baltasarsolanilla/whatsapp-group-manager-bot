import {
	groupMembershipRepository,
	groupRepository,
} from '@database/repositories';
import { Group, User } from '@prisma/client';
import { AppError } from '@utils/AppError';

export const groupMembershipService = {
	async getInactive(
		groupWaId: string
	): Promise<{ user: User; group: Group }[]> {
		// const days = 30;
		// const msPerDay = 24 * 60 * 60 * 1000;
		// const threshold = Date.now() - days * msPerDay;
		const test = 60 * 1 * 1000;
		const threshold = Date.now() - test;

		const group = await groupRepository.getByWaId(groupWaId);
		if (!group) {
			throw AppError.notFound('Group not found');
		}
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
