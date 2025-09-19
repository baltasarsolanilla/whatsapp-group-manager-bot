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
		if (groupWaId) {
			// const removedMemberIds: string[] = [];
			const entriesToRemove = await this.listInactiveMembers(groupWaId);

			console.log(entriesToRemove);
			// ! Need to implement batch logic to avoid max limits
			// * Let's make a batch of 2 for now
			const firstBatch = entriesToRemove.slice(0, 2);
			const participants = firstBatch.map((entry) =>
				extractPhoneNumberFromWhatsappPn(entry.user.whatsappPn)
			);

			try {
				// ! Keeping it comment out for security reasons
				// await evolutionAPI.groupService.removeMembers(participants, groupWaId);
				// Add to removalHistory -> SUCCESS
				// Remove from removalQueue
			} catch {
				// Add to removalHistory -> FAILED
				// Remove from removalQueue
			}

			return participants;
		}

		throw AppError.required('GroupId is required');
	},
};
