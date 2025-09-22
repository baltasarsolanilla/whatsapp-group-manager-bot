import { removalQueueService } from '@logic/services';
import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

export const removalQueueController = {
	runRemovalQueue: catchAsync(async (req: Request, res: Response) => {
		const { groupId } = req.body ?? {};
		// ! Forcing groupWaId for now to avoid catastrophes :P
		if (!groupId) {
			throw AppError.required('GroupId is required');
		}

		const membersRemoved =
			await removalQueueService.removeInactiveMembers(groupId);
		resSuccess(res, membersRemoved);
	}),
	listRemovalQueue: catchAsync(async (req: Request, res: Response) => {
		const groupWaId = req.query.groupId as string;
		const members = await removalQueueService.listInactiveMembers(groupWaId);
		resSuccess(res, members);
	}),
	syncRemovalQueue: catchAsync(async (req: Request, res: Response) => {
		const { groupId } = req.body ?? {};
		if (!groupId) {
			throw AppError.required('GroupId is required');
		}

		const removalQueue =
			await removalQueueService.addInactiveMembersToRemovalQueue(groupId);
		resSuccess(res, removalQueue);
	}),
};
