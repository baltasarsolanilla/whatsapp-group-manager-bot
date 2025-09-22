import { removalQueueService } from '@logic/services';
import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

export const removalQueueController = {
	listRemovalQueue: catchAsync(async (req: Request, res: Response) => {
		const groupWaId = req.query.groupWaId as string;
		const members = await removalQueueService.listInactiveMembers(groupWaId);
		resSuccess(res, members);
	}),
	syncRemovalQueue: catchAsync(async (req: Request, res: Response) => {
		const { groupWaId } = req.body ?? {};

		if (!groupWaId) {
			throw AppError.required('groupWaId is required');
		}

		const removalQueue =
			await removalQueueService.addInactiveMembersToRemovalQueue(groupWaId);
		resSuccess(res, removalQueue);
	}),
	runRemovalQueue: catchAsync(async (req: Request, res: Response) => {
		const { groupWaId, batchSize = 5, dryRun = true } = req.body ?? {};

		// ! Forcing groupWaId for now to avoid catastrophes :P
		if (!groupWaId) {
			throw AppError.required('groupWaId is required');
		}

		const config = {
			groupWaId,
			batchSize,
			dryRun,
		};

		const removedMembers =
			await removalQueueService.removeInactiveMembers(config);
		resSuccess(res, removedMembers);
	}),
};
