import {
	groupMembershipRepository,
	groupRepository,
	removalHistoryRepository,
	removalQueueRepository,
} from '@database/repositories';
import { extractPhoneNumberFromWhatsappPn } from '@logic/helpers';
import { groupMembershipService } from '@logic/services';
import { RemovalOutcome, RemovalQueue } from '@prisma/client';
import { AppError } from '@utils/AppError';

export const removalQueueService = {
	/**
	 * Adds all inactive members to the removal queue for a given group.
	 * @param groupWaId The Group whatsapp id.
	 */
	async addInactiveMembersToRemovalQueue(groupWaId: string) {
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

	async removeInactiveMembers({
		groupWaId,
		batchSize,
		dryRun,
	}: {
		groupWaId?: string;
		batchSize: number;
		dryRun: boolean;
	}) {
		const groupId = groupWaId
			? (await groupRepository.getByWaId(groupWaId))?.id
			: null;

		// ! Avoid running batch if group not found (for now)
		if (!groupId) {
			throw AppError.notFound(`Group not found: ${groupWaId}`);
		}

		const queueItems = await removalQueueRepository.getBatch({
			groupId,
			take: batchSize,
		});

		let outcome: RemovalOutcome = RemovalOutcome.FAILURE;
		let reason: string;
		let queuePhoneNumbers: string[] = [];

		try {
			queuePhoneNumbers = queueItems
				.filter(Boolean)
				.map((item) =>
					extractPhoneNumberFromWhatsappPn(item.user.whatsappPn as string)
				);

			if (dryRun) {
				console.log(
					'Evolution API ~ DRY RUN ~ remove members from group',
					queuePhoneNumbers
				);
			} else {
				console.log(
					'Evolution API ~ LEGIT RUN ~ remove members from group',
					queuePhoneNumbers
				);
				// ! Keeping it comment out for security reasons
				// await evolutionAPI.groupService.removeMembers(queuePhoneNumbers, groupWaId);
			}

			outcome = RemovalOutcome.SUCCESS;
			reason = 'Inactive user removal';
		} catch {
			outcome = RemovalOutcome.FAILURE;
			reason = 'Unknown error';
		}

		for (const item of queueItems) {
			const {
				id,
				user: { id: userId },
				group: { id: groupId },
			} = item;

			removalQueueRepository.remove(id);
			removalHistoryRepository.add({
				userId,
				groupId,
				outcome,
				reason,
			});
			groupMembershipRepository.removeByUserAndGroup({
				userId,
				groupId,
			});
		}

		return queuePhoneNumbers;
	},
};
