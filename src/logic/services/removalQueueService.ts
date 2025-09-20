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
		// TODO: set/update by admin, although this is whatsapp sensitive, shouldn't change.
		const BATCH_SIZE = 5;

		// ! Forcing groupWaId for now to avoid catastrophes :P
		if (!groupWaId) {
			throw AppError.required('GroupId is required');
		}

		const groupId = groupWaId
			? (await groupRepository.getByWaId(groupWaId))?.id
			: undefined;

		// ! Avoid running batch if group not found (for now)
		if (!groupId) {
			throw AppError.notFound(`Group not found: ${groupWaId}`);
		}

		const queueItems = await removalQueueRepository.getBatch({
			groupId,
			take: BATCH_SIZE,
		});

		let outcome: RemovalOutcome = RemovalOutcome.FAILURE;
		let reason: string;
		let queuePhoneNumbers: string[] = [];

		try {
			queuePhoneNumbers = queueItems.map((item) =>
				extractPhoneNumberFromWhatsappPn(item.user.whatsappPn)
			);

			console.log(
				'Evolution API ~ remove members from group',
				queuePhoneNumbers
			);
			// ! Keeping it comment out for security reasons
			// await evolutionAPI.groupService.removeMembers(queuePhoneNumbers, groupWaId);
			outcome = RemovalOutcome.SUCCESS;
			reason = 'Inactive user removal';
		} catch {
			outcome = RemovalOutcome.FAILURE;
			reason = 'Unknown error';
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
	},
};
