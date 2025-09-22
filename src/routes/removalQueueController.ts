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
		const { groupWaId } = req.body ?? {};

		if (!groupWaId) {
			throw AppError.required('groupWaId is required');
		}

		const removalQueue =
			await removalWorkflowService.syncRemovalQueue(groupWaId);
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
		const { groupWaId, batchSize, delayMs, dryRun } = req.body ?? {};

		// TODO: streamline error message
		if (!groupWaId || !batchSize || !delayMs || dryRun === undefined) {
			throw AppError.required('Missing config props');
		}

		const config = {
			groupWaId,
			batchSize,
			dryRun,
			delayMs,
		};

		const phsRemoved = await removalWorkflowService.runWorkflow(config);

		resSuccess(res, phsRemoved);
	}),
};
