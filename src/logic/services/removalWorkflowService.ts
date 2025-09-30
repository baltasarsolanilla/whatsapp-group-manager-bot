import {
	groupMembershipRepository,
	groupRepository,
	removalHistoryRepository,
	removalQueueRepository,
} from '@database/repositories';
import { extractPhoneNumberFromWhatsappPn, sleep } from '@logic/helpers';
import { Group, RemovalOutcome, User } from '@prisma/client';
import { AppError } from '@utils/AppError';
import { removalQueueService } from './removalQueueService';

type RemovalQueueRow = {
	id: string;
	user: User;
	group: Group;
};

type RunWorkflowConfigType = {
	batchSize: number;
	delayMs: number;
	groupWaId: string;
	dryRun: boolean;
};

export const removalWorkflowService = {
	async runWorkflow(config: RunWorkflowConfigType) {
		const { batchSize, delayMs, groupWaId, dryRun } = config;

		// Sync Phase
		await this.syncRemovalQueue(groupWaId);

		// Removal Phase
		const phoneNumbersRemoved = await this.runRemovalInBatches({
			groupWaId,
			batchSize,
			delayMs,
			dryRun,
		});

		return phoneNumbersRemoved;
	},

	/**
	 * Sync Phase - populate removalQueue with inactive users
	 */
	async syncRemovalQueue(groupWaId: string) {
		return removalQueueService.syncInactiveMembersToRemovalQueue(groupWaId);
	},

	/**
	 * Removal Phase - process users in batches
	 */
	async runRemovalInBatches({
		groupWaId,
		batchSize,
		dryRun,
		delayMs,
	}: {
		groupWaId: string;
		batchSize: number;
		delayMs: number;
		dryRun: boolean;
	}) {
		const groupId = groupWaId
			? (await groupRepository.getByWaId(groupWaId))?.id
			: undefined;

		if (!groupId) {
			throw AppError.notFound(`Group not found: ${groupWaId}`);
		}

		const removedPhoneNumbers: string[] = [];

		while (true) {
			const queueItems: RemovalQueueRow[] =
				await removalQueueRepository.getNextBatch({
					groupId,
					take: batchSize,
				});

			if (queueItems.length === 0) {
				break;
			}

			let outcome: RemovalOutcome = RemovalOutcome.FAILURE;
			let reason: string;
			let queuePhoneNumbers: string[] = [];

			try {
				queuePhoneNumbers = queueItems
					.map((item) =>
						extractPhoneNumberFromWhatsappPn(item.user.whatsappPn as string)
					)
					.filter(Boolean); // Remove any undefined values

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
				removedPhoneNumbers.push(...queuePhoneNumbers);
			} catch {
				outcome = RemovalOutcome.FAILURE;
				reason = 'Unknown error';
			}

			/**
			 * Archive the removed memberships into removalHistory, and delete from removalQueue & groupMembership
			 */
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

			await sleep(delayMs);
		}

		return removedPhoneNumbers;
	},
};
