import {
	groupMembershipRepository,
	groupRepository,
	removalHistoryRepository,
	removalQueueRepository,
} from '@database/repositories';
import { sleep } from '@logic/helpers';
import { Group, RemovalOutcome, User } from '@prisma/client';
import { AppError } from '@utils/AppError';
import { removalQueueService } from './removalQueueService';
import { FeatureFlag, FeatureFlagService } from '../../featureFlags';

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
		// Check QUEUE_REMOVAL feature flag before running workflow
		if (!FeatureFlagService.isEnabled(FeatureFlag.QUEUE_REMOVAL)) {
			console.log(
				'🔒 QUEUE_REMOVAL feature flag is disabled. Skipping removal workflow.'
			);
			return [];
		}

		const { batchSize, delayMs, groupWaId, dryRun } = config;

		// Sync Phase
		await this.syncRemovalQueue(groupWaId);

		// Removal Phase
		const whatsappIdsRemoved = await this.runRemovalInBatches({
			groupWaId,
			batchSize,
			delayMs,
			dryRun,
		});

		return whatsappIdsRemoved;
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
		// Check QUEUE_REMOVAL feature flag before running removal batches
		if (!FeatureFlagService.isEnabled(FeatureFlag.QUEUE_REMOVAL)) {
			console.log(
				'🔒 QUEUE_REMOVAL feature flag is disabled. Skipping removal batches.'
			);
			return [];
		}

		const groupId = groupWaId
			? (await groupRepository.getByWaId(groupWaId))?.id
			: undefined;

		if (!groupId) {
			throw AppError.notFound(`Group not found: ${groupWaId}`);
		}

		const removedWhatsappIds: string[] = [];

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
			let queueWhatsappIds: string[] = [];

			try {
				queueWhatsappIds = queueItems
					.map((item) => item.user.whatsappId as string)
					.filter(Boolean); // Remove any undefined values

				if (dryRun) {
					console.log(
						'Evolution API ~ DRY RUN ~ remove members from group',
						queueWhatsappIds
					);
				} else {
					console.log(
						'Evolution API ~ LEGIT RUN ~ remove members from group',
						queueWhatsappIds
					);
					// ! Keeping it comment out for security reasons
					// await evolutionAPI.groupService.removeMembers(queueWhatsappIds, groupWaId);
				}

				outcome = RemovalOutcome.SUCCESS;
				reason = 'Inactive user removal';
				removedWhatsappIds.push(...queueWhatsappIds);
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

		return removedWhatsappIds;
	},
};
