import {
	groupRepository,
	removalQueueRepository,
} from '@database/repositories';
import { groupMembershipService } from '@logic/services';
import { RemovalQueue } from '@prisma/client';

export const removalQueueService = {
	/**
	 * Adds all inactive members to the removal queue for a given group.
	 * @param groupWaId The Group whatsapp id.
	 */
	async syncInactiveMembersToRemovalQueue(groupWaId: string) {
		const memberships = await groupMembershipService.getInactive(groupWaId);
		const newQueueMembers: RemovalQueue[] = [];
		for (const membership of memberships) {
			const newMember = await removalQueueRepository.upsertUser({
				userId: membership.user.id,
				groupId: membership.group.id,
			});
			newQueueMembers.push(newMember);
		}

		return newQueueMembers;
	},

	async listInactiveMembers(groupWaId?: string) {
		const groupId = groupWaId
			? (await groupRepository.getByWaId(groupWaId))?.id
			: undefined;

		return removalQueueRepository.getUsers(groupId);
	},
};
