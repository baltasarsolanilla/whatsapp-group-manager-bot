import { removalQueueService } from '@logic/services';
import { AppError } from '@utils/AppError';
import { catchAsync } from '@utils/catchAsync';
import { resSuccess } from '@utils/resSuccess';
import { Request, Response } from 'express';

export const removalQueueController = {
	listRemovalQueue: catchAsync(async (req: Request, res: Response) => {
		const groupJid = req.query.groupJid as string;
		const members = await removalQueueService.listInactiveMembers(groupJid);
		resSuccess(res, members);
	}),
	syncRemovalQueue: catchAsync(async (req: Request, res: Response) => {
		const { groupJid } = req.body ?? {};

		if (!groupJid) {
			throw AppError.required('groupJid is required');
		}

		const removalQueue =
			await removalQueueService.addInactiveMembersToRemovalQueue(groupJid);
		resSuccess(res, removalQueue);
	}),
	runRemovalQueue: catchAsync(async (req: Request, res: Response) => {
		const { groupJid } = req.body ?? {};
		// ! Forcing groupWaId for now to avoid catastrophes :P
		if (!groupJid) {
			throw AppError.required('groupJid is required');
		}

		const membersRemoved =
			await removalQueueService.removeInactiveMembers(groupJid);
		resSuccess(res, membersRemoved);
	}),
};
