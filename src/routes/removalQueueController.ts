import { removalQueueService } from '@logic/services';
import { removalWorkflowService } from '@logic/services/removalWorkflowService';
import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess, resAccepted } from '@utils/resSuccess';
import { Request, Response } from 'express';

export const removalQueueController = {
	list: catchAsync(async (req: Request, res: Response) => {
		const groupWaId = req.query.groupWaId as string;
		const members = await removalQueueService.listInactiveMembers(groupWaId);
		resSuccess(res, members);
	}),
	syncQueue: catchAsync(async (req: Request, res: Response) => {
		const { groupWaId, inactivityWindowMs } = req.body ?? {};

		if (!groupWaId) {
			throw AppError.required('groupWaId is required');
		}

		if (!inactivityWindowMs || typeof inactivityWindowMs !== 'number') {
			throw AppError.required('inactivityWindowMs must be a number');
		}

		if (inactivityWindowMs <= 0) {
			throw AppError.badRequest('inactivityWindowMs must be a positive number');
		}

		const removalQueue = await removalWorkflowService.syncRemovalQueue(
			groupWaId,
			inactivityWindowMs
		);
		resSuccess(res, removalQueue);
	}),
	runQueue: catchAsync(async (req: Request, res: Response) => {
		const { groupWaId, batchSize = 5, dryRun = true, delayMs } = req.body ?? {};

		if (!groupWaId || !batchSize || !delayMs || dryRun === undefined) {
			throw AppError.required('Missing config props');
		}

		const config = {
			groupWaId,
			batchSize,
			dryRun,
			delayMs,
		};

		// Run workflow in background to prevent HTTP timeout
		// For large groups, this can take 1+ hour (e.g., 1000 users / 5 per batch * 10s delay = ~33 minutes)
		removalWorkflowService.runRemovalInBatches(config).catch((error) => {
			console.error('Background removal workflow failed:', error);
		});

		resAccepted(res, {
			message: 'Removal workflow started in background',
			config,
		});
	}),
	runWorkflow: catchAsync(async (req: Request, res: Response) => {
		const { groupWaId, batchSize, delayMs, dryRun, inactivityWindowMs } =
			req.body ?? {};

		// TODO: streamline error message
		if (!groupWaId || !batchSize || !delayMs || dryRun === undefined) {
			throw AppError.required('Missing config props');
		}

		if (!inactivityWindowMs || typeof inactivityWindowMs !== 'number') {
			throw AppError.required('inactivityWindowMs must be a number');
		}

		if (inactivityWindowMs <= 0) {
			throw AppError.badRequest('inactivityWindowMs must be a positive number');
		}

		const config = {
			groupWaId,
			batchSize,
			dryRun,
			delayMs,
			inactivityWindowMs,
		};

		// Run workflow in background to prevent HTTP timeout
		// WARNING: This operation can take 1+ hour for large groups
		// Expected runtime: (inactive_users / batchSize) * (delayMs / 1000) seconds
		// Example: 1000 users, batch size 5, 10s delay = ~33 minutes
		removalWorkflowService.runWorkflow(config).catch((error) => {
			console.error('Background removal workflow failed:', error);
		});

		resAccepted(res, {
			message: 'Removal workflow started in background',
			config,
		});
	}),
	addUsers: catchAsync(async (req: Request, res: Response) => {
		const { groupId, participants } = req.body ?? {};

		if (!groupId) {
			throw AppError.required('groupId is required');
		}

		if (!participants || !Array.isArray(participants)) {
			throw AppError.required('participants must be an array');
		}

		const addedEntries =
			await removalQueueService.addInactiveMembersToRemovalQueue(
				groupId,
				participants
			);
		resSuccess(res, addedEntries);
	}),
	clearQueue: catchAsync(async (req: Request, res: Response) => {
		const result = await removalQueueService.clearAllQueue();
		resSuccess(res, {
			message: 'Removal queue cleared successfully',
			deletedCount: result.count,
		});
	}),
	hardcodePopulate: catchAsync(async (req: Request, res: Response) => {
		const { groupId, userIds } = req.body ?? {};

		// Validate groupId
		if (!groupId) {
			throw AppError.required('groupId is required');
		}

		// Validate userIds
		if (!userIds || !Array.isArray(userIds)) {
			throw AppError.required('userIds must be an array');
		}

		if (userIds.length === 0) {
			throw AppError.badRequest('userIds array cannot be empty');
		}

		const result = await removalQueueService.hardcodePopulateRemovalQueue(
			groupId,
			userIds
		);
		resSuccess(res, result);
	}),
};
