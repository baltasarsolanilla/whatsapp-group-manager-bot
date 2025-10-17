import { removalQueueService } from '@logic/services';
import { removalWorkflowService } from '@logic/services/removalWorkflowService';
import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
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

		const removedMembers =
			await removalWorkflowService.runRemovalInBatches(config);
		resSuccess(res, removedMembers);
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

		const phsRemoved = await removalWorkflowService.runWorkflow(config);

		resSuccess(res, phsRemoved);
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
};
