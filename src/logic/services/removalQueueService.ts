import {
	groupRepository,
	removalHistoryRepository,
	removalQueueRepository,
} from '@database/repositories';
import { extractPhoneNumberFromWhatsappPn } from '@logic/helpers';
import { groupMembershipService } from '@logic/services';
import { Group, RemovalOutcome } from '@prisma/client';
import { AppError } from '@utils/AppError';

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
			// ! Need to implement batch logic to avoid max limits
			// * Let's make a batch of 2 for now
			const entriesToRemove = await this.listInactiveMembers(groupWaId);
			const queueItems = entriesToRemove.slice(0, 2);
			const queuePhoneNumbers = queueItems.map((item) =>
				extractPhoneNumberFromWhatsappPn(item.user.whatsappPn)
			);

			let outcome: RemovalOutcome = RemovalOutcome.FAILURE;
			let reason: string;

			try {
				// ! Keeping it comment out for security reasons
				// await evolutionAPI.groupService.removeMembers(queuePhoneNumbers, groupWaId);
				outcome = RemovalOutcome.SUCCESS;
				reason = 'Inactive user removal';

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (err: any) {
				outcome = RemovalOutcome.FAILURE;
				reason = err?.message ?? 'Unknown error';
			}

			for (const item of queueItems) {
				removalQueueRepository.remove(item.id);
				removalHistoryRepository.add({
					userId: item.user.id,
					groupId: item.group.id,
					outcome,
					reason,
				});
			}

			return queuePhoneNumbers;
		}

		throw AppError.required('GroupId is required');
	},
};
