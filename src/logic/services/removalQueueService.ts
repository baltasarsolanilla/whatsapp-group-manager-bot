import {
	groupRepository,
	removalQueueRepository,
} from '@database/repositories';
import { extractPhoneNumberFromWhatsappPn } from '@logic/helpers';
import { Group } from '@prisma/client';
import { AppError } from '@utils/AppError';
import { groupMembershipService } from './groupMembershipService';

export const removalQueueService = {
	/**
	 * Adds all inactive members to the removal queue for a given group.
	 * @param group The Group object.
	 */
	async addInactiveMembersToRemovalQueue(group: Group) {
		const memberships = await groupMembershipService.getInactive(group);
		for (const membership of memberships) {
			await removalQueueRepository.addUser({
				userId: membership.user.id,
				groupId: membership.group.id,
			});
		}
	},

	async listInactiveMembers(groupWaId?: string) {
		const groupId = groupWaId
			? (await groupRepository.getByWaId(groupWaId))?.id
			: undefined;

		return removalQueueRepository.getUsers(groupId);
	},

	async removeInactiveMembers(groupWaId?: string) {
		// ! Forcing groupWaId for now to avoid catastrophes :P
		if (groupWaId) {
			// const removedMemberIds: string[] = [];
			const entriesToRemove = await this.listInactiveMembers(groupWaId);

			// ! Need to implement batch logic to avoid max limits
			// * Let's make a batch of 2 for now
			const queueItems = entriesToRemove.slice(0, 2);
			const participants = queueItems.map((item) =>
				extractPhoneNumberFromWhatsappPn(item.user.whatsappPn)
			);

			try {
				// ! Keeping it comment out for security reasons
				// await evolutionAPI.groupService.removeMembers(participants, groupWaId);
			} catch {
				// Add to removalHistory -> FAILED | FAILED
				// Remove from removalQueue
			}

			for (const item of queueItems) {
				removalQueueRepository.remove(item.id);
			}

			return participants;
		}

		throw AppError.required('GroupId is required');
	},
};
