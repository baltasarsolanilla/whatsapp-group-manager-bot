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

type ProgressCallback = (update: {
	processed: number;
	total?: number;
	message?: string;
}) => void;

type RunWorkflowConfigType = {
	batchSize: number;
	delayMs: number;
	groupWaId: string;
	dryRun: boolean;
	inactivityWindowMs: number;
	signal?: AbortSignal;
	onProgress?: ProgressCallback;
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

		const {
			batchSize,
			delayMs,
			groupWaId,
			dryRun,
			inactivityWindowMs,
			signal,
			onProgress,
		} = config;

		// Report initial progress
		onProgress?.({ processed: 0, message: 'Starting workflow: sync phase' });

		// Check cancellation before sync
		if (signal?.aborted) {
			console.log('Job cancelled before sync phase');
			onProgress?.({ processed: 0, message: 'Cancelled before sync phase' });
			return [];
		}

		// Sync Phase
		await this.syncRemovalQueue(groupWaId, inactivityWindowMs);
		onProgress?.({
			processed: 0,
			message: 'Sync phase complete, starting removal phase',
		});

		// Check cancellation before removal phase
		if (signal?.aborted) {
			console.log('Job cancelled after sync phase');
			onProgress?.({ processed: 0, message: 'Cancelled after sync phase' });
			return [];
		}

		// Removal Phase
		const whatsappIdsRemoved = await this.runRemovalInBatches({
			groupWaId,
			batchSize,
			delayMs,
			dryRun,
			signal,
			onProgress,
		});

		return whatsappIdsRemoved;
	},

	/**
	 * Sync Phase - populate removalQueue with inactive users
	 */
	async syncRemovalQueue(groupWaId: string, inactivityWindowMs: number) {
		return removalQueueService.syncInactiveMembersToRemovalQueue(
			groupWaId,
			inactivityWindowMs
		);
	},

	/**
	 * Removal Phase - process users in batches
	 *
	 * WARNING: This operation can take a very long time for large groups.
	 * Expected runtime: (queue_size / batchSize) * (delayMs / 1000) seconds
	 * Example: 1000 users with batchSize=5 and delayMs=10000 → ~33 minutes
	 *
	 * This should be run as a background job, not in an HTTP request handler.
	 */
	async runRemovalInBatches({
		groupWaId,
		batchSize,
		dryRun,
		delayMs,
		signal,
		onProgress,
	}: {
		groupWaId: string;
		batchSize: number;
		delayMs: number;
		dryRun: boolean;
		signal?: AbortSignal;
		onProgress?: ProgressCallback;
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
		let processedCount = 0;

		// Report initial progress with 0 processed
		onProgress?.({
			processed: 0,
			message: 'Starting batch removal',
		});

		while (true) {
			// Check for cancellation at the start of each batch
			if (signal?.aborted) {
				console.log('Job cancelled during batch processing');
				onProgress?.({
					processed: processedCount,
					message: 'Job cancelled',
				});
				break;
			}

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
			} catch (error) {
				outcome = RemovalOutcome.FAILURE;
				reason = 'Unknown error';
				console.error(
					'Error removing users from group via Evolution API:',
					error,
					{
						groupWaId,
						queueWhatsappIds,
					}
				);
			}

			/**
			 * Archive the removed memberships into removalHistory, and delete from removalQueue & groupMembership
			 * Only perform database cleanup if removal was successful
			 */
			if (dryRun) {
				console.log(
					'DRY RUN: Skipping database changes (removalQueue removal, removalHistory addition, groupMembership removal)'
				);
			} else if (outcome === RemovalOutcome.SUCCESS) {
				// Only clean up database if removal actually succeeded
				for (const item of queueItems) {
					const {
						id,
						user: { id: userId },
						group: { id: groupId },
					} = item;

					try {
						await removalQueueRepository.remove(id);
						await removalHistoryRepository.add({
							userId,
							groupId,
							outcome,
							reason,
						});
						await groupMembershipRepository.removeByUserAndGroup({
							userId,
							groupId,
						});
					} catch (error) {
						console.error(
							'Error during database cleanup for removed user:',
							error,
							{
								userId,
								groupId,
								queueItemId: id,
							}
						);
						// Continue processing other items even if one fails
					}
				}
			} else {
				// Removal failed - log failure in history but keep queue items for retry
				console.log(
					'Removal failed - logging failure in history and keeping users in queue for retry'
				);
				for (const item of queueItems) {
					const {
						id,
						user: { id: userId },
						group: { id: groupId },
					} = item;

					try {
						await removalHistoryRepository.add({
							userId,
							groupId,
							outcome: RemovalOutcome.FAILURE,
							reason,
						});
					} catch (error) {
						console.error('Error logging removal failure to history:', error, {
							userId,
							groupId,
							queueItemId: id,
						});
					}
				}
			}

			// Update progress after processing this batch
			processedCount += queueItems.length;
			onProgress?.({
				processed: processedCount,
				message: `Processed batch: ${outcome === RemovalOutcome.SUCCESS ? 'success' : 'failed'}`,
			});

			await sleep(delayMs);
		}

		return removedWhatsappIds;
	},
};
